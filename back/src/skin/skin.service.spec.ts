import { SkinService } from './skin.service';
import { User } from '../user/user.entity';
import { Skin } from './skin.entity';

describe('SkinService', () => {
  let service: SkinService;
  const mockUserRepository = {
    findOneBy: jest.fn(),
  } as any;
  const mockSkinRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
  } as any;
  const mockRedisService = {
    pay: jest.fn(),
  } as any;

  beforeEach(() => {
    service = new SkinService(
      mockUserRepository,
      mockSkinRepository,
      mockRedisService,
    );
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all skins', async () => {
      const skins = [{ name: 's1' }] as Skin[];
      mockSkinRepository.find.mockResolvedValue(skins);
      const result = await service.findAll();
      expect(result).toBe(skins);
      expect(mockSkinRepository.find).toHaveBeenCalled();
    });

    it('throws when repository fails', async () => {
      const error = new Error('db error');
      mockSkinRepository.find.mockRejectedValue(error);
      await expect(service.findAll()).rejects.toThrow(error);
    });
  });

  describe('purchase', () => {
    it('adds skin to user when payment succeeds', async () => {
      const user = { id: 1, ownedSkins: [], save: jest.fn() } as any;
      user.save.mockResolvedValue(user);
      const skin = { name: 'red', price: 100, priceUnit: 'gold' } as any;
      mockUserRepository.findOneBy.mockResolvedValue(user);
      mockSkinRepository.findOneBy.mockResolvedValue(skin);
      mockRedisService.pay.mockResolvedValue(true);

      const result = await service.purchase('red', 1);

      expect(mockRedisService.pay).toHaveBeenCalledWith(1, {
        value: skin.price,
        unit: skin.priceUnit,
      });
      expect(user.save).toHaveBeenCalled();
      expect(user.ownedSkins).toContain('red');
      expect(result).toBe(user);
    });

    it('does not add skin when payment fails', async () => {
      const user = { id: 1, ownedSkins: [], save: jest.fn() } as any;
      const skin = { name: 'red', price: 100, priceUnit: 'gold' } as any;
      mockUserRepository.findOneBy.mockResolvedValue(user);
      mockSkinRepository.findOneBy.mockResolvedValue(skin);
      mockRedisService.pay.mockResolvedValue(false);

      const result = await service.purchase('red', 1);

      expect(user.save).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
