import { UpgradeService } from './upgrade.service';
import { Unit } from '../shared/shared.model';
import { Upgrade } from './upgrade.entity';
import { BuyUpgradeDto } from './dto/buy-upgrade.dto';

jest.mock('src/UserUpgrade/userUpgrade.entity', () => {
  class UserUpgrade {}
  return { UserUpgrade };
}, { virtual: true });
jest.mock('src/redis/redis.service', () => {
  class RedisService {}
  return { RedisService };
}, { virtual: true });

describe('UpgradeService', () => {
  let service: UpgradeService;
  const mockUserUpgradeRepository = {
    exist: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  } as any;
  const mockUpgradeRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  } as any;
  const mockRedisService = {
    getUpgrade: jest.fn(),
    pay: jest.fn(),
    addUpgrade: jest.fn(),
    incrUpgrade: jest.fn(),
    incrUpgradeAmountBought: jest.fn(),
    incrClick: jest.fn(),
  } as any;

  beforeEach(() => {
    service = new UpgradeService(
      mockUserUpgradeRepository,
      mockUpgradeRepository,
      mockRedisService,
    );
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all upgrades', async () => {
      const upgrades = [{ id: 1 } as Upgrade];
      mockUpgradeRepository.find.mockResolvedValue(upgrades);

      const result = await service.findAll();

      expect(mockUpgradeRepository.find).toHaveBeenCalled();
      expect(result).toBe(upgrades);
    });
  });

  describe('buyUpgrade', () => {
    it('adds upgrade when user does not have it', async () => {
      const dto = { upgradeId: '1', quantity: '2' } as BuyUpgradeDto;
      const upgrade = {
        id: 1,
        price: 10,
        price_unit: Unit.UNIT,
        value: 5,
        generationUpgradeId: 0,
      } as Upgrade;
      mockRedisService.getUpgrade.mockResolvedValue({});
      mockUpgradeRepository.findOne.mockResolvedValue(upgrade);
      jest.spyOn(service, 'canCreateUpgrade').mockResolvedValue(true);
      mockRedisService.pay.mockResolvedValue(true);

      await service.buyUpgrade(dto, 1);

      expect(mockRedisService.addUpgrade).toHaveBeenCalledWith(1, {
        id: 1,
        amount: 2,
        amountUnit: Unit.UNIT,
        amountBought: 2,
        value: 5,
        generationUpgradeId: 0,
      });
    });

    it('increments upgrade when user already has it', async () => {
      const dto = { upgradeId: '1', quantity: '1' } as BuyUpgradeDto;
      const upgrade = {
        id: 1,
        price: 10,
        price_unit: Unit.UNIT,
        value: 5,
        generationUpgradeId: 0,
      } as Upgrade;
      mockRedisService.getUpgrade.mockResolvedValue({ amountBought: 1 });
      mockUpgradeRepository.findOne.mockResolvedValue(upgrade);
      mockRedisService.pay.mockResolvedValue(true);

      await service.buyUpgrade(dto, 1);

      expect(mockRedisService.incrUpgrade).toHaveBeenCalledWith(
        1,
        1,
        1,
        Unit.UNIT,
      );
      expect(mockRedisService.incrUpgradeAmountBought).toHaveBeenCalledWith(
        1,
        1,
        1,
      );
    });

    it('normalizes price above 1000 and adjusts unit', async () => {
      const dto = { upgradeId: '1', quantity: '1' } as BuyUpgradeDto;
      const upgrade = {
        id: 1,
        price: 2000,
        price_unit: Unit.UNIT,
        value: 5,
        generationUpgradeId: 0,
      } as Upgrade;
      mockRedisService.getUpgrade.mockResolvedValue({ amountBought: 1 });
      mockUpgradeRepository.findOne.mockResolvedValue(upgrade);
      mockRedisService.pay.mockResolvedValue(true);

      await service.buyUpgrade(dto, 1);

      expect(mockRedisService.pay).toHaveBeenCalledWith(1, {
        value: 2,
        unit: Unit.K,
      });
    });

    it('applies multiplier when amountBought is at least 10', async () => {
      const dto = { upgradeId: '1', quantity: '1' } as BuyUpgradeDto;
      const upgrade = {
        id: 1,
        price: 10,
        price_unit: Unit.UNIT,
        value: 5,
        generationUpgradeId: 0,
      } as Upgrade;
      const userUpgrade = { amountBought: 20 };
      mockRedisService.getUpgrade.mockResolvedValue(userUpgrade);
      mockUpgradeRepository.findOne.mockResolvedValue(upgrade);
      mockRedisService.pay.mockResolvedValue(true);

      await service.buyUpgrade(dto, 1);

      const multiplier = Math.floor(userUpgrade.amountBought / 10) * 2;
      let value = upgrade.price * Math.pow(10, multiplier);
      let unit = upgrade.price_unit;
      while (value > 1001) {
        value /= 1000;
        unit += 3;
      }

      expect(mockRedisService.pay).toHaveBeenCalledWith(1, { value, unit });
    });

    it('does not apply multiplier when amountBought is less than 10', async () => {
      const dto = { upgradeId: '1', quantity: '1' } as BuyUpgradeDto;
      const upgrade = {
        id: 1,
        price: 10,
        price_unit: Unit.UNIT,
        value: 5,
        generationUpgradeId: 0,
      } as Upgrade;
      const userUpgrade = { amountBought: 5 };
      mockRedisService.getUpgrade.mockResolvedValue(userUpgrade);
      mockUpgradeRepository.findOne.mockResolvedValue(upgrade);
      mockRedisService.pay.mockResolvedValue(true);

      await service.buyUpgrade(dto, 1);

      expect(mockRedisService.pay).toHaveBeenCalledWith(1, {
        value: upgrade.price,
        unit: upgrade.price_unit,
      });
    });
  });

  describe('buyClick', () => {
    it('pays and increments click when amount positive', async () => {
      mockRedisService.pay.mockResolvedValue(true);
      mockRedisService.incrClick.mockResolvedValue({
        amount: 1,
        unit: Unit.UNIT,
      });

      const result = await service.buyClick(100, Unit.UNIT, 1);

      expect(mockRedisService.pay).toHaveBeenCalled();
      expect(mockRedisService.incrClick).toHaveBeenCalledWith(1, 1, Unit.UNIT);
      expect(result).toEqual({ amount: 1, unit: Unit.UNIT });
    });

    it('returns zero when amount non-positive', async () => {
      const result = await service.buyClick(0, Unit.UNIT, 1);
      expect(result).toEqual({ amount: 0, unit: 0 });
      expect(mockRedisService.pay).not.toHaveBeenCalled();
    });

    it('converts small payments to lower units', async () => {
      mockRedisService.pay.mockResolvedValue(true);
      mockRedisService.incrClick.mockResolvedValue({ amount: 500, unit: -3 });

      const result = await service.buyClick(50, Unit.UNIT, 1);

      expect(mockRedisService.pay).toHaveBeenCalled();
      expect(mockRedisService.incrClick).toHaveBeenCalledWith(1, 500, -3);
      expect(result).toEqual({ amount: 500, unit: -3 });
    });

    it('returns zero when payment fails', async () => {
      mockRedisService.pay.mockResolvedValue(false);

      const result = await service.buyClick(100, Unit.UNIT, 1);

      expect(mockRedisService.pay).toHaveBeenCalled();
      expect(mockRedisService.incrClick).not.toHaveBeenCalled();
      expect(result).toEqual({ amount: 0, unit: 0 });
    });
  });

  describe('canCreateUpgrade', () => {
    it('returns true for first upgrade', async () => {
      const upgrade = { id: 1 } as Upgrade;
      const result = await service.canCreateUpgrade(1, upgrade);
      expect(result).toBe(true);
    });

    it('returns true when previous upgrade exists', async () => {
      const upgrade = { id: 2 } as Upgrade;
      mockRedisService.getUpgrade.mockResolvedValue({ id: 1 });
      const result = await service.canCreateUpgrade(1, upgrade);
      expect(mockRedisService.getUpgrade).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(true);
    });

    it('returns false when previous upgrade missing', async () => {
      const upgrade = { id: 2 } as Upgrade;
      mockRedisService.getUpgrade.mockResolvedValue({});
      const result = await service.canCreateUpgrade(1, upgrade);
      expect(result).toBe(false);
    });
  });

  describe('updateById', () => {
    it('updates when upgrade exists', async () => {
      mockUserUpgradeRepository.exist.mockResolvedValue(true);
      await service.updateById(1, 2, 3, Unit.UNIT, 4);
      expect(mockUserUpgradeRepository.update).toHaveBeenCalledWith(
        { upgradeId: 2, userId: 1 },
        { amount: 3, amountUnit: Unit.UNIT, amountBought: 4 },
      );
    });

    it('saves when upgrade does not exist', async () => {
      mockUserUpgradeRepository.exist.mockResolvedValue(false);
      await service.updateById(1, 2, 3, Unit.K, 4);
      expect(mockUserUpgradeRepository.save).toHaveBeenCalledWith({
        upgradeId: 2,
        userId: 1,
        amount: 3,
        amountUnit: Unit.K,
        amountBought: 4,
      });
    });
  });
});
