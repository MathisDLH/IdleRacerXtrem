import { Test, TestingModule } from "@nestjs/testing";
import { GameGateway, UserSocket } from "../../src/game/game.gateway";
import { UserService } from "../../src/user/user.service";
import { UpgradeService } from "../../src/upgrade/upgrade.service";
import { RedisService } from "../../src/redis/redis.service";
import { Unit } from "../../src/shared/shared.model";
import { User } from "../../src/user/user.entity";

describe("GameGateway (test folder)", () => {
  let gateway: GameGateway;
  let redisService: jest.Mocked<RedisService>;
  let userService: jest.Mocked<UserService>;
  let upgradeService: jest.Mocked<UpgradeService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameGateway,
        {
          provide: UserService,
          useValue: { findById: jest.fn(), update: jest.fn() },
        },
        { provide: UpgradeService, useValue: { updateById: jest.fn() } },
        {
          provide: RedisService,
          useValue: {
            getUserData: jest.fn(),
            resetUserInRedis: jest.fn(),
            getUserClick: jest.fn(),
            getUserClickUnit: jest.fn(),
            incrMoney: jest.fn(),
            updateUserData: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get(GameGateway);
    redisService = module.get(RedisService);
    userService = module.get(UserService);
    upgradeService = module.get(UpgradeService);
  });

  describe("onModuleInit", () => {
    it("ticks and persists periodically", async () => {
      jest.useFakeTimers();
      const client: UserSocket = {
        user: { id: 1 } as User,
        emit: jest.fn(),
      } as any;
      gateway.socketConnected.add(client);

      const updateSpy = jest.spyOn(gateway, "updateMoney").mockResolvedValue({
        moneyData: { amount: 0, unit: Unit.UNIT },
        upgradesData: [],
      });
      const emitMoneySpy = jest
        .spyOn(gateway, "emitMoney")
        .mockResolvedValue(undefined);
      const emitUpgradeSpy = jest
        .spyOn(gateway, "emitUpgrade")
        .mockResolvedValue(undefined);
      const pushSpy = jest
        .spyOn(gateway, "pushRedisToDb")
        .mockResolvedValue(undefined);

      gateway.onModuleInit();

      await jest.advanceTimersByTimeAsync(1000);
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(emitMoneySpy).toHaveBeenCalledTimes(1);
      expect(emitUpgradeSpy).toHaveBeenCalledTimes(1);

      await jest.advanceTimersByTimeAsync(9000);
      expect(pushSpy).toHaveBeenCalledTimes(1);

      gateway.onModuleDestroy();
      jest.useRealTimers();
    });
  });

  describe("emit helpers", () => {
    it("emitMoney sends payload", async () => {
      const client: UserSocket = {
        user: { id: 1 } as User,
        emit: jest.fn(),
      } as any;
      redisService.getUserData.mockResolvedValue({
        money: 5,
        moneyUnit: Unit.UNIT,
      } as any);

      await gateway.emitMoney(client, {
        moneyData: { amount: 1, unit: Unit.UNIT },
      });

      expect(client.emit).toHaveBeenCalledWith("money", {
        money: 5,
        unit: Unit.UNIT,
        moneyBySec: 1,
        moneyBySecUnit: Unit.UNIT,
      });
    });

    it("emitUpgrade sends payload", async () => {
      const client: UserSocket = {
        user: { id: 1 } as User,
        emit: jest.fn(),
      } as any;
      redisService.getUserData.mockResolvedValue({ upgrades: [1, 2] } as any);
      const realtime = { upgradesData: [{ id: 1 }] };

      await gateway.emitUpgrade(client, realtime);

      expect(client.emit).toHaveBeenCalledWith("upgrades", {
        upgrades: [1, 2],
        realTimeData: realtime.upgradesData,
      });
    });
  });

  describe("updateMoney", () => {
    it("uses default seconds when omitted", async () => {
      const user = { id: 1 } as unknown as User;
      const redisInfos = {
        money: 0,
        moneyUnit: Unit.UNIT,
        click: 0,
        clickUnit: Unit.UNIT,
        upgrades: [
          {
            id: 2,
            generationUpgradeId: 1,
            amount: 2,
            amountUnit: Unit.UNIT,
            amountBought: 0,
            value: 3,
          },
          {
            id: 1,
            generationUpgradeId: 0,
            amount: 0,
            amountUnit: Unit.UNIT,
            amountBought: 0,
            value: 1,
          },
        ],
      };
      redisService.getUserData.mockResolvedValue(redisInfos as any);
      const expected = {
        moneyData: { amount: 6, unit: Unit.UNIT },
        upgradesData: [],
      };
      redisService.updateUserData.mockResolvedValue(expected as any);

      const result = await gateway.updateMoney(user);

      expect(redisService.updateUserData).toHaveBeenCalledWith(
        user,
        redisInfos as any,
      );
      expect(result).toBe(expected);
    });
  });
});
