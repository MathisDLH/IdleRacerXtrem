import { RedisService } from './redis.service';
import { Unit } from '../shared/shared.model';
import { User } from '../user/user.entity';
import { PurchaseError } from '../exceptions/PurchaseError';

const createMockRedisClient = () => {
  const store = new Map<string, any>();
  return {
    get: jest.fn(async (key: string) => store.get(key)),
    set: jest.fn(async (key: string, value: any) => {
      store.set(key, value);
    }),
    hset: jest.fn(async (key: string, fieldOrObj: any, value?: any) => {
      const hash = store.get(key) || {};
      if (typeof fieldOrObj === 'object') {
        Object.assign(hash, fieldOrObj);
      } else {
        hash[fieldOrObj] = value;
      }
      store.set(key, hash);
    }),
    hget: jest.fn(async (key: string, field: string) => {
      const hash = store.get(key) || {};
      return hash[field];
    }),
    hgetall: jest.fn(async (key: string) => {
      return store.get(key) || {};
    }),
    hincrbyfloat: jest.fn(async (key: string, field: string, amount: number) => {
      const hash = store.get(key) || {};
      hash[field] = (parseFloat(hash[field]) || 0) + amount;
      store.set(key, hash);
      return hash[field];
    }),
    incrbyfloat: jest.fn(async (key: string, amount: number) => {
      const value = (parseFloat(store.get(key)) || 0) + amount;
      store.set(key, value);
      return value;
    }),
    decrby: jest.fn(async (key: string, amount: number) => {
      const value = (parseFloat(store.get(key)) || 0) - amount;
      store.set(key, value);
      return value;
    }),
    keys: jest.fn(async (pattern: string) => {
      const prefix = pattern.replace('*', '');
      return Array.from(store.keys()).filter((k) => k.startsWith(prefix));
    }),
    del: jest.fn(async (...keys: string[]) => {
      keys.forEach((k) => store.delete(k));
    }),
    multi: jest.fn(() => {
      return {
        set(key: string, value: any) {
          store.set(key, value);
          return this;
        },
        exec: async () => undefined,
      };
    }),
  } as any;
};

describe('RedisService', () => {
  let service: RedisService;
  let client: any;
  const user: User = {
    id: 1,
    money: 100,
    money_unite: Unit.UNIT,
    click: 1,
    click_unite: Unit.UNIT,
    userUpgrade: [
      {
        upgrade: { id: 1, value: 1, generationUpgradeId: 0 } as any,
        amount: 0,
        amountUnit: Unit.UNIT,
        amountBought: 0,
      },
    ],
  } as any;

  beforeEach(() => {
    client = createMockRedisClient();
    service = new RedisService(client);
  });

  it('increments money correctly', async () => {
    await service.loadUserInRedis(user);
    const result = await service.incrMoney(user.id, 50, Unit.UNIT);
    expect(result).toEqual({ amount: 50, unit: Unit.UNIT });
    const money = await service.getUserMoney(user.id);
    expect(money).toBeCloseTo(150);
  });

  it('increments click correctly', async () => {
    await service.loadUserInRedis(user);
    const result = await service.incrClick(user.id, 2, Unit.UNIT);
    expect(result).toEqual({ amount: 3, unit: Unit.UNIT });
  });

  it('handles upgrade operations', async () => {
    await service.loadUserInRedis(user);
    await service.incrUpgradeAmountBought(user.id, 1, 2);
    let upgrade = await service.getUpgrade(user.id, 1);
    expect(upgrade.amountBought).toBe(2);
    const incr = await service.incrUpgrade(user.id, 1, 5, Unit.UNIT);
    expect(incr).toEqual({ amountGenerated: 5, generatedUnit: Unit.UNIT });
    upgrade = await service.getUpgrade(user.id, 1);
    expect(upgrade.amount).toBeCloseTo(5);
  });

  it('pays when enough money and throws otherwise', async () => {
    await service.loadUserInRedis(user);
    await service.incrMoney(user.id, 50, Unit.UNIT);
    const paid = await service.pay(user.id, { value: 120, unit: Unit.UNIT });
    expect(paid).toBe(true);
    await expect(
      service.pay(user.id, { value: 500, unit: Unit.UNIT }),
    ).rejects.toBeInstanceOf(PurchaseError);
  });

  it('loads, retrieves, and resets user data', async () => {
    await service.loadUserInRedis(user);
    const data = await service.getUserData(user);
    expect(data).toEqual({
      userId: 1,
      money: 100,
      moneyUnit: Unit.UNIT,
      click: 1,
      clickUnit: Unit.UNIT,
      upgrades: [
        {
          id: 1,
          amount: 0,
          amountUnit: Unit.UNIT,
          amountBought: 0,
          value: 1,
          generationUpgradeId: 0,
        },
      ],
    });
    await service.incrMoney(user.id, 50, Unit.UNIT);
    await service.resetUserInRedis(user);
    const money = await service.getUserMoney(user.id);
    expect(money).toBe(100);
  });

  it('handles money overflow and unit conversion', async () => {
    await service.loadUserInRedis(user);
    await service.incrMoney(user.id, 2000, Unit.UNIT);
    expect(await service.getUserMoneyUnit(user.id)).toBe(Unit.K);
    expect(await service.getUserMoney(user.id)).toBeCloseTo(2.1);
    await service.incrMoney(user.id, 1500, Unit.UNIT);
    expect(await service.getUserMoney(user.id)).toBeCloseTo(3.6);
  });

  it('handles click overflow and unit conversion', async () => {
    await service.loadUserInRedis(user);
    let result = await service.incrClick(user.id, 2000, Unit.UNIT);
    expect(result.unit).toBe(Unit.K);
    expect(result.amount).toBeCloseTo(2.001);
    result = await service.incrClick(user.id, 1500, Unit.UNIT);
    expect(result.unit).toBe(Unit.K);
    expect(result.amount).toBeCloseTo(3.501);
  });

  it('handles upgrade overflow and unit conversion', async () => {
    await service.loadUserInRedis(user);
    await service.incrUpgrade(user.id, 1, 2000, Unit.UNIT);
    await service.incrUpgrade(user.id, 1, 1500, Unit.UNIT);
    const upgrade = await service.getUpgrade(user.id, 1);
    expect(upgrade.amountUnit).toBe(Unit.K);
    expect(upgrade.amount).toBeCloseTo(3.5);
  });

  it('decrements unit when paying leaves less than one', async () => {
    const richUser: User = { ...user, money: 1, money_unite: Unit.K } as User;
    await service.loadUserInRedis(richUser);
    const paid = await service.pay(richUser.id, { value: 0.5, unit: Unit.K });
    expect(paid).toBe(true);
    expect(await service.getUserMoneyUnit(richUser.id)).toBe(Unit.UNIT);
    expect(await service.getUserMoney(richUser.id)).toBeCloseTo(500);
  });
});

