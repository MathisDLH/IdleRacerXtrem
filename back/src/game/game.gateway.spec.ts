import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway, UserSocket } from './game.gateway';
import { UserService } from '../user/user.service';
import { UpgradeService } from '../upgrade/upgrade.service';
import { RedisService } from '../redis/redis.service';
import { Unit } from '../shared/shared.model';
import { User } from '../user/user.entity';

describe('GameGateway', () => {
  let gateway: GameGateway;
  let userService: jest.Mocked<UserService>;
  let upgradeService: jest.Mocked<UpgradeService>;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameGateway,
        { provide: UserService, useValue: { findById: jest.fn(), update: jest.fn() } },
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

    gateway = module.get<GameGateway>(GameGateway);
    userService = module.get(UserService);
    upgradeService = module.get(UpgradeService);
    redisService = module.get(RedisService);
  });

  describe('connection and disconnection flow', () => {
    it('connects and disconnects a user', async () => {
      const user = { id: 1, updatedAt: new Date() } as unknown as User;
      userService.findById.mockResolvedValue(user);
      redisService.resetUserInRedis.mockResolvedValue(undefined);
      const updateSpy = jest
        .spyOn(gateway, 'updateMoney')
        .mockResolvedValue({ moneyData: { amount: 0, unit: Unit.UNIT }, upgradesData: [] });

      const client: UserSocket = {
        userId: '1',
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      await gateway.handleConnection(client);

      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(client.user).toBe(user);
      expect(gateway.socketConnected.has(client)).toBe(true);
      expect(redisService.resetUserInRedis).toHaveBeenCalledWith(user);
      expect(updateSpy).toHaveBeenCalled();

      const pushSpy = jest
        .spyOn(gateway, 'pushRedisToDb')
        .mockResolvedValue(undefined);

      gateway.handleDisconnect(client);

      expect(pushSpy).toHaveBeenCalledWith(user);
      expect(gateway.socketConnected.has(client)).toBe(false);
    });
  });

  describe('periodic ticks', () => {
    it('runs periodic update and persistence', async () => {
      jest.useFakeTimers();
      const user = { id: 1 } as unknown as User;
      const client: UserSocket = { user, emit: jest.fn() } as any;
      gateway.socketConnected.add(client);

      jest
        .spyOn(gateway, 'updateMoney')
        .mockResolvedValue({ moneyData: { amount: 0, unit: Unit.UNIT }, upgradesData: [] });
      const moneySpy = jest.spyOn(gateway, 'emitMoney').mockResolvedValue(undefined);
      const upgradeSpy = jest.spyOn(gateway, 'emitUpgrade').mockResolvedValue(undefined);
      const persistSpy = jest.spyOn(gateway, 'pushRedisToDb').mockResolvedValue(undefined);

      gateway.onModuleInit();

      await jest.advanceTimersByTimeAsync(1000);
      expect(moneySpy).toHaveBeenCalled();
      expect(upgradeSpy).toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(10000);
      expect(persistSpy).toHaveBeenCalled();

      gateway.onModuleDestroy();
      jest.useRealTimers();
    });
  });

  describe('handleClick', () => {
    it('increments money and emits event', async () => {
      const user = { id: 1 } as unknown as User;
      const client: UserSocket = { user, emit: jest.fn() } as any;
      redisService.getUserClick.mockResolvedValue(1);
      redisService.getUserClickUnit.mockResolvedValue('0');
      redisService.incrMoney.mockResolvedValue({ amount: 2, unit: Unit.UNIT });
      redisService.getUserData.mockResolvedValue({ money: 10, moneyUnit: Unit.UNIT } as any);

      await gateway.handleClick(client);

      expect(redisService.incrMoney).toHaveBeenCalledWith(1, 1, 0);
      expect(client.emit).toHaveBeenCalledWith('money', {
        money: 10,
        unit: Unit.UNIT,
        moneyErnByClick: 2,
        moneyErnByClickUnit: Unit.UNIT,
      });
    });
  });

  describe('emitMoney', () => {
    it('sends money payload', async () => {
      const user = { id: 1 } as unknown as User;
      const client: UserSocket = { user, emit: jest.fn() } as any;
      redisService.getUserData.mockResolvedValue({ money: 5, moneyUnit: Unit.UNIT } as any);

      await gateway.emitMoney(client, {
        moneyData: { amount: 1, unit: Unit.UNIT },
      });

      expect(client.emit).toHaveBeenCalledWith('money', {
        money: 5,
        unit: Unit.UNIT,
        moneyBySec: 1,
        moneyBySecUnit: Unit.UNIT,
      });
    });
  });

  describe('emitUpgrade', () => {
    it('sends upgrade payload', async () => {
      const user = { id: 1 } as unknown as User;
      const client: UserSocket = { user, emit: jest.fn() } as any;
      redisService.getUserData.mockResolvedValue({ upgrades: [1, 2] } as any);
      const realtime = { upgradesData: [{ id: 1 }] };

      await gateway.emitUpgrade(client, realtime);

      expect(client.emit).toHaveBeenCalledWith('upgrades', {
        upgrades: [1, 2],
        realTimeData: realtime.upgradesData,
      });
    });
  });

  describe('updateMoney', () => {
    it('updates money with upgrades', async () => {
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
      const expected = { moneyData: { amount: 6, unit: Unit.UNIT }, upgradesData: [] };
      redisService.updateUserData.mockResolvedValue(expected as any);

      const result = await gateway.updateMoney(user, 1);

      expect(redisService.updateUserData).toHaveBeenCalledWith(user, redisInfos as any);
      expect(result).toBe(expected);
    });
  });

  describe('pushRedisToDb', () => {
    it('persists redis data to db', async () => {
      const user = { id: 1 } as unknown as User;
      const redisInfos = {
        money: 100,
        moneyUnit: Unit.UNIT,
        click: 1,
        clickUnit: Unit.UNIT,
        upgrades: [
          {
            id: 1,
            amount: 2,
            amountUnit: Unit.K,
            amountBought: 3,
          },
          {
            id: 2,
            amount: 4,
            amountUnit: Unit.MILLION,
            amountBought: 5,
          },
        ],
      };
      redisService.getUserData.mockResolvedValue(redisInfos as any);

      await gateway.pushRedisToDb(user);

      expect(userService.update).toHaveBeenCalledWith({
        id: 1,
        money: 100,
        money_unite: Unit.UNIT,
        click: 1,
        click_unite: Unit.UNIT,
      } as any);
      expect(upgradeService.updateById).toHaveBeenCalledTimes(2);
      expect(upgradeService.updateById).toHaveBeenCalledWith(1, 1, 2, Unit.K, 3);
      expect(upgradeService.updateById).toHaveBeenCalledWith(1, 2, 4, Unit.MILLION, 5);
    });
  });
});
