import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserService } from "src/user/user.service";
import { User } from "src/user/user.entity";
import { RedisService } from "src/redis/redis.service";
import { Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { IRedisData, IRedisUpgrade, Unit, UpdateSummary } from "../shared/shared.model";
import { UpgradeService } from "../upgrade/upgrade.service";

export interface UserSocket extends Socket {
  userId: string;
  user?: User;
}

export interface MoneyPayload {
  money: number;
  unit: Unit;
  moneyBySec?: number;
  moneyBySecUnit?: Unit;
}  
  
export interface UpdateSummary {
  moneyData: { amount: number; unit: Unit };
  upgradesData: {
    upgrade: IRedisUpgrade;
    amountGenerated: number;
    generatedUnit: Unit;
  }[];
}

@WebSocketGateway({ cors: { origin: "*" } })
export class GameGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit,
    OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  socketConnected: Set<UserSocket> = new Set();

  private readonly logger: Logger = new Logger(GameGateway.name);

  constructor(
    private readonly userService: UserService,
    private readonly upgradeService: UpgradeService,
    private readonly redisService: RedisService,
  ) {}

  private tickHandle: NodeJS.Timeout | null = null;
  private persistHandle: NodeJS.Timeout | null = null;

  onModuleInit() {
    this.tickHandle = setInterval(async () => {
      for (const client of Array.from(this.socketConnected)) {
        try {
          if (!client?.user) continue;
          const realTimeData = await this.updateMoney(client.user);
          await this.emitMoney(client, realTimeData);
          await this.emitUpgrade(client, realTimeData);
        } catch (err) {
          this.logger.error(`tick error for user ${client?.user?.id}: ${err}`);
        }
      }
    }, 1000);
    this.tickHandle.unref();

    this.persistHandle = setInterval(async () => {
      for (const client of Array.from(this.socketConnected)) {
        try {
          if (!client?.user) continue;
          await this.pushRedisToDb(client.user);
        } catch (err) {
          this.logger.error(
            `persist error for user ${client?.user?.id}: ${err}`,
          );
        }
      }
    }, 10000);
    this.persistHandle.unref();
  }

  onModuleDestroy() {
    if (this.tickHandle) clearInterval(this.tickHandle);
    if (this.persistHandle) clearInterval(this.persistHandle);
  }

  public async emitMoney(
    client: UserSocket,
    realTimeData: UpdateSummary | null = null,
  ) {
    const userData = await this.redisService.getUserData(client.user);
    const payload: MoneyPayload = {
      moneyBySec?: number;
      moneyBySecUnit?: Unit;
      money: userData.money,
      unit: userData.moneyUnit,
    };
    if (realTimeData) {
      payload.moneyBySec = realTimeData.moneyData.amount;
      payload.moneyBySecUnit = realTimeData.moneyData.unit;
    }
    client.emit("money", payload);
  }

  public async emitUpgrade(
    client: UserSocket,
    realTimeData: UpdateSummary | null = null,
  ) {
    const userData = await this.redisService.getUserData(client.user);
    const payload: {
      upgrades: IRedisUpgrade[];
      realTimeData?: UpdateSummary["upgradesData"];
    } = { upgrades: userData.upgrades };
    if (realTimeData) {
      payload.realTimeData = realTimeData.upgradesData;
    }
    client.emit("upgrades", payload);
  }

  @SubscribeMessage("click")
  async handleClick(client: UserSocket): Promise<void> {
    const click = await this.redisService.getUserClick(client.user.id);
    const clickUnit = +(await this.redisService.getUserClickUnit(
      client.user.id,
    ));
    const moneyErnedByClick = await this.redisService.incrMoney(
      client.user.id,
      click,
      clickUnit,
    );
    client.emit("money", {
      money: (await this.redisService.getUserData(client.user)).money,
      unit: (await this.redisService.getUserData(client.user)).moneyUnit,
      moneyErnByClick: moneyErnedByClick.amount,
      moneyErnByClickUnit: moneyErnedByClick.unit,
    });
  }

  async handleConnection(client: UserSocket) {
    this.logger.log(`${client.userId} connected`);
    try {
      const user = await this.userService.findById(+client.userId);
      if (!user) {
        this.logger.warn(`User ${client.userId} not found. Disconnecting.`);
        client.disconnect(true);
        return;
      }
      client.user = user;
      this.socketConnected.add(client);
      // reset Redis state to DB snapshot on first connection to avoid stale/huge balances
      await this.redisService.resetUserInRedis(user);
      const now = new Date();
      const secondsSinceLastUpdate =
        (now.getTime() - user.updatedAt.getTime()) / 1000;
      await this.updateMoney(user, secondsSinceLastUpdate);
    } catch (err) {
      this.logger.error(`handleConnection error for ${client.userId}: ${err}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: UserSocket) {
    this.logger.log(`${client.userId} disconnect`);
    this.pushRedisToDb(client.user);
    this.socketConnected.delete(client);
  }

  async updateMoney(
    user: User,
    seconds = 1,
  ): Promise<UpdateSummary> {

    const redisInfos = await this.redisService.getUserData(user);
    if (!redisInfos?.upgrades?.length) {
      return { moneyData: { amount: 0, unit: Unit.UNIT }, upgradesData: [] };
    }
    redisInfos.upgrades.forEach((element) => {
      if (element.id > 1) {
        const generatedUpgrade = redisInfos.upgrades.find(
          (upgrade) => upgrade.id == element.generationUpgradeId,
        );
        if (generatedUpgrade) {
          generatedUpgrade.amount = element.amount * element.value * seconds;
          generatedUpgrade.amountUnit = element.amountUnit;
        }
      } else {
        redisInfos.money = element.amount * element.value * seconds;
        redisInfos.moneyUnit = element.amountUnit;
      }
      element.amount = 0;
    });
    return await this.redisService.updateUserData(user, redisInfos);
  }

  async pushRedisToDb(user: User) {
    const redisInfos: IRedisData = await this.redisService.getUserData(user);
    const newUser = {
      id: user.id,
      money: redisInfos.money,
      money_unite: redisInfos.moneyUnit,
      click: redisInfos.click,
      click_unite: redisInfos.clickUnit,
    };
    const upgrades = redisInfos.upgrades;
    await this.userService.update(newUser as User);
    for (const upgrade of upgrades) {
      await this.upgradeService.updateById(
        user.id,
        upgrade.id,
        upgrade.amount,
        upgrade.amountUnit,
        upgrade.amountBought,
      );
    }
  }
}
