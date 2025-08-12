import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {UserService} from 'src/user/user.service';
import {User} from 'src/user/user.entity';
import {RedisService} from 'src/redis/redis.service';
import {Logger, OnModuleInit} from "@nestjs/common";
import {IRedisData, Unit} from "../shared/shared.model";
import {UpgradeService} from "../upgrade/upgrade.service";


export interface UserSocket extends Socket {
    userId: string;
    user?: User;
}

@WebSocketGateway({cors: {origin: '*'}})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {



    @WebSocketServer()
    server: Server;

    socketConnected: Set<UserSocket> = new Set();

    private readonly logger: Logger = new Logger(GameGateway.name)

    constructor(private readonly userService: UserService,
                private readonly upgradeService: UpgradeService,
                private readonly redisService: RedisService) {
    }

    onModuleInit() {
        setInterval(async () => {
            this.socketConnected.forEach(async (client) => {
                if (client) {
                    let realTimeData = await this.updateMoney(client.user);

                    await this.emitMoney(client, realTimeData);
                    await this.emitUpgrade(client, realTimeData);
                }
            });
        }, 1000);

        setInterval(async () => {
            this.socketConnected.forEach(async (client) => {
                if (client) {
                    this.pushRedisToDb(client.user);
                }
            });
        }, 10000);
    }

    public async emitMoney(client: UserSocket, realTimeData = null) {
        if(realTimeData == null) {
            client.emit('money',
            {
                money : (await this.redisService.getUserData(client.user)).money,
                unit : (await this.redisService.getUserData(client.user)).moneyUnit,
            });
        }else{
            client.emit('money',
            {
                money : (await this.redisService.getUserData(client.user)).money,
                unit : (await this.redisService.getUserData(client.user)).moneyUnit,
                moneyBySec : realTimeData.moneyData.amount,
                moneyBySecUnit : realTimeData.moneyData.unit
            });
        }
       
    }

    public async emitUpgrade(client: UserSocket, realTimeData = null) {
        if(realTimeData == null) {
            client.emit('upgrades', {
                upgrades : (await this.redisService.getUserData(client.user)).upgrades,
            })
        }else{
            client.emit('upgrades', {
                upgrades : (await this.redisService.getUserData(client.user)).upgrades,
                realTimeData : realTimeData.upgradesData
            })
        }
       
    }

    @SubscribeMessage('click')
    async handleClick(client: UserSocket): Promise<void> {
        let click = await this.redisService.getUserClick(client.user.id);
        let clickUnit = +await this.redisService.getUserClickUnit(client.user.id);
        let moneyErnedByClick = await this.redisService.incrMoney(client.user.id, click, clickUnit);
        client.emit('money',
            {
                money: (await this.redisService.getUserData(client.user)).money,
                unit: (await this.redisService.getUserData(client.user)).moneyUnit,
                moneyErnByClick: moneyErnedByClick.amount,
                moneyErnByClickUnit: moneyErnedByClick.unit
            });
    }


    async handleConnection(client: UserSocket) {
        //CHECK HERE IS USERID ALREADY EXIST ?
        this.logger.log(`${client.userId} connected`);
        this.userService.findById(+client.userId).then(user => {
            client.user = user;
            this.socketConnected.add(client);
            this.redisService.loadUserInRedis(user);
            const maintenant = new Date();
            const differenceEnSecondes = (maintenant.getTime() - user.updatedAt.getTime()) / 1000;
            this.updateMoney(user, differenceEnSecondes);
        });
    }

    handleDisconnect(client: UserSocket) {
        this.logger.log(`${client.userId} disconnect`);
        this.pushRedisToDb(client.user);
        this.socketConnected.delete(client);
    }


    async updateMoney(user: User, seconds = 1 ): Promise<{ moneyData: { amount: number; unit: Unit; }; upgradesData: any[]; }> {
        const redisInfos = await this.redisService.getUserData(user);
        if (redisInfos.upgrades.length > 0) {
            redisInfos.upgrades.forEach(element => {

                if (element.id > 1) {
                    let generatedUpgrade = redisInfos.upgrades.find((upgrade) => upgrade.id == element.generationUpgradeId);
                    generatedUpgrade.amount = element.amount * element.value * seconds;
                    generatedUpgrade.amountUnit = element.amountUnit;

                } else { // Fan
                    redisInfos.money = element.amount * element.value * seconds;
                    redisInfos.moneyUnit = element.amountUnit
                }
                element.amount = 0;
            });
            return await this.redisService.updateUserData(user, redisInfos);
        }
        return {moneyData: { amount: 0, unit: Unit.UNIT }, upgradesData: [] };
    }

    async pushRedisToDb(user: User) {
        const redisInfos: IRedisData = await this.redisService.getUserData(user);
        const newUser = {id: user.id, money: redisInfos.money, money_unite: redisInfos.moneyUnit, click: redisInfos.click, click_unite: redisInfos.clickUnit};
        const upgrades = redisInfos.upgrades;
        await this.userService.update(newUser as User);
        for (const upgrade of upgrades) {
            await this.upgradeService.updateById(user.id, upgrade.id, upgrade.amount, upgrade.amountUnit, upgrade.amountBought);
        }

    }
}