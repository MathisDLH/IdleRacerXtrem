import { UserService } from './user.service';
import { User } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  const mockUserRepository = {
    findOne: jest.fn(),
  } as any;
  const mockUserUpgradeRepository = {} as any;

  beforeEach(() => {
    service = new UserService(mockUserRepository, mockUserUpgradeRepository);
  });

  it('returns user when found', async () => {
    const user = { id: 1 } as User;
    mockUserRepository.findOne.mockResolvedValue(user);
    const result = await service.findById(1);
    expect(result).toBe(user);
  });

  it('returns null when user not found', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    const result = await service.findById(42);
    expect(result).toBeNull();
  });
});
