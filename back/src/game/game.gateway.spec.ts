import 'reflect-metadata';
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

  afterEach(() => {
    gateway.onModuleDestroy();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('connection and disconnection flow', () => {
    it('connects and disconnects a user (success path)', async () => {
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

      const pushSpy = jest.spyOn(gateway, 'pushRedisToDb').mockResolvedValue(undefined);

      gateway.handleDisconnect(client);

      expect(pushSpy).toHaveBeenCalledWith(user);
      expect(gateway.socketConnected.has(client)).toBe(false);
    });

    it('disconnects user when not found', async () => {
      userService.findById.mockResolvedValue(null);
      const client: UserSocket = {
        userId: '999',
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalledWith(true);
      expect(gateway.socketConnected.has(client)).toBe(false);
    });

    it('disconnects user on connection error', async () => {
      userService.findById.mockRejectedValue(new Error('DB error'));
      const client: UserSocket = {
        userId: '1',
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalledWith(true);
      expect(gateway.socketConnected.has(client)).toBe(false);
    });

    it('passes secondsSinceLastUpdate to updateMoney', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T00:00:10.000Z'));
      const user = { id: 1, updatedAt: new Date('2025-01-01T00:00:05.000Z') } as unknown as User;
      userService.findById.mockResolvedValue(user);
      redisService.resetUserInRedis.mockResolvedValue(undefined);
      const updateSpy = jest
        .spyOn(gateway, 'updateMoney')
        .mockResolvedValue({ moneyData: { amount: 0, unit: Unit.UNIT }, upgradesData: [] });

      const client: UserSocket = { userId: '1', emit: jest.fn(), disconnect: jest.fn() } as any;

      await gateway.handleConnection(client);

      expect(updateSpy).toHaveBeenCalledWith(user, 5);
    });
  });

  describe('periodic ticks', () => {
    it('runs periodic update and persistence (success paths)', async () => {
      jest.useFakeTimers();
      const user = { id: 1 } as unknown as User;
      const client: UserSocket = { user, emit: jest.fn() } as any;
      gateway.socketConnected.add(client);

      jest.spyOn(gateway, 'updateMoney').mockResolvedValue({
        moneyData: { amount: 0, unit: Unit.UNIT },
        upgradesData: [],
      });
      const moneySpy = jest.spyOn(gateway, 'emitMoney').mockResolvedValue(undefined);
      const upgradeSpy = jest.spyOn(gateway, 'emitUpgrade').mockResolvedValue(undefined);
      const persistSpy = jest.spyOn(gateway, 'pushRedisToDb').mockResolvedValue(undefined);

      gateway.onModuleInit();

      await jest.advanceTimersByTimeAsync(1000);
      expect(moneySpy).toHaveBeenCalled();
      expect(upgradeSpy).toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(10000);
      expect(persistSpy).toHaveBeenCalled();
    });

    it('skips clients without user (continue branch)', async () => {
      jest.useFakeTimers();
      const client: UserSocket = { emit: jest.fn() } as any; // pas de client.user
      gateway.socketConnected.add(client);

      const upd = jest.spyOn(gateway, 'updateMoney');
      const moneySpy = jest.spyOn(gateway, 'emitMoney');
      const upgradeSpy = jest.spyOn(gateway, 'emitUpgrade');
      const persistSpy = jest.spyOn(gateway, 'pushRedisToDb');

      gateway.onModuleInit();
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(10000);

      expect(upd).not.toHaveBeenCalled();
      expect(moneySpy).not.toHaveBeenCalled();
      expect(upgradeSpy).not.toHaveBeenCalled();
      expect(persistSpy).not.toHaveBeenCalled();

      gateway.onModuleDestroy();
      jest.useRealTimers();

    });

    it('logs tick errors (catch branch in tick loop)', async () => {
      jest.useFakeTimers();
      const user = { id: 42 } as unknown as User;
      const client: UserSocket = { user, emit: jest.fn() } as any;
      gateway.socketConnected.add(client);

      jest.spyOn(gateway, 'updateMoney').mockRejectedValue(new Error('Redis error'));
      const loggerErrorSpy = jest.spyOn((gateway as any).logger, 'error');

      gateway.onModuleInit();
      await jest.advanceTimersByTimeAsync(1000);

      expect(loggerErrorSpy).toHaveBeenCalled(); // couvre le catch du tick
    });

    it('logs persist errors (catch branch in persist loop)', async () => {
      jest.useFakeTimers();
      const user = { id: 7 } as unknown as User;
      const client: UserSocket = { user, emit: jest.fn() } as any;
      gateway.socketConnected.add(client);

      jest.spyOn(gateway, 'pushRedisToDb').mockRejectedValue(new Error('DB error'));
      const loggerErrorSpy = jest.spyOn((gateway as any).logger, 'error');

      gateway.onModuleInit();
      await jest.advanceTimersByTimeAsync(10000);

      expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it('clears intervals on onModuleDestroy', async () => {
      jest.useFakeTimers();
      const clearSpy = jest.spyOn(global, 'clearInterval');

      gateway.onModuleInit();
      gateway.onModuleDestroy();

      expect(clearSpy).toHaveBeenCalledTimes(2);
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
    it('sends money payload (with realTimeData)', async () => {
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

    it('sends money payload (without realTimeData)', async () => {
      const user = { id: 1 } as unknown as User;
      const client: UserSocket = { user, emit: jest.fn() } as any;
      redisService.getUserData.mockResolvedValue({ money: 5, moneyUnit: Unit.UNIT } as any);

      await gateway.emitMoney(client);

      expect(client.emit).toHaveBeenCalledWith('money', {
        money: 5,
        unit: Unit.UNIT,
      });
    });
  });

  describe('emitUpgrade', () => {
    it('sends upgrade payload (with realTimeData)', async () => {
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

    it('sends upgrade payload (without realTimeData)', async () => {
      const user = { id: 1 } as unknown as User;
      const client: UserSocket = { user, emit: jest.fn() } as any;
      redisService.getUserData.mockResolvedValue({ upgrades: [1, 2] } as any);

      await gateway.emitUpgrade(client);

      expect(client.emit).toHaveBeenCalledWith('upgrades', {
        upgrades: [1, 2],
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

    it('returns empty data when no upgrades', async () => {
      const user = { id: 1 } as unknown as User;
      redisService.getUserData.mockResolvedValue({
        money: 0,
        moneyUnit: Unit.UNIT,
        click: 0,
        clickUnit: Unit.UNIT,
        upgrades: [],
      } as any);

      const result = await gateway.updateMoney(user, 1);

      expect(result).toEqual({ moneyData: { amount: 0, unit: Unit.UNIT }, upgradesData: [] });
    });

    it.each([undefined, { money: 0, moneyUnit: Unit.UNIT, click: 0, clickUnit: Unit.UNIT }])(
      'returns empty data when redisService.getUserData returns %p',
      async (redisReturn) => {
        const user = { id: 1 } as unknown as User;
        redisService.getUserData.mockResolvedValue(redisReturn as any);
        const result = await gateway.updateMoney(user, 1);
        expect(result).toEqual({ moneyData: { amount: 0, unit: Unit.UNIT }, upgradesData: [] });
      },
    );

    it('handles missing generated upgrade gracefully', async () => {
      const user = { id: 1 } as unknown as User;
      const redisInfos = {
        money: 0,
        moneyUnit: Unit.UNIT,
        click: 0,
        clickUnit: Unit.UNIT,
        upgrades: [
          {
            id: 2,
            generationUpgradeId: 999,
            amount: 2,
            amountUnit: Unit.UNIT,
            amountBought: 0,
            value: 3,
          },
        ],
      };
      redisService.getUserData.mockResolvedValue(redisInfos as any);
      const expected = { moneyData: { amount: 0, unit: Unit.UNIT }, upgradesData: [] };
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
          { id: 1, amount: 2, amountUnit: Unit.K, amountBought: 3 },
          { id: 2, amount: 4, amountUnit: Unit.MILLION, amountBought: 5 },
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
