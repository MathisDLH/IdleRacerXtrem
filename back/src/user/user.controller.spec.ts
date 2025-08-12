import { UsersController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from '../dto/user/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UserService>;

  beforeEach(() => {
    service = {
      findUsersByScore: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    controller = new UsersController(service);
  });

  describe('findScoreTab', () => {
    it('returns list of users on success', async () => {
      const users: User[] = [{ id: 1 } as User];
      service.findUsersByScore.mockResolvedValue(users);

      await expect(controller.findScoreTab()).resolves.toBe(users);
      expect(service.findUsersByScore).toHaveBeenCalled();
    });

    it('throws an error when service fails', async () => {
      service.findUsersByScore.mockRejectedValue(new Error('Service error'));

      await expect(controller.findScoreTab()).rejects.toThrow('Service error');
    });
  });

  describe('find', () => {
    it('returns user on success', async () => {
      const user = { id: 1 } as User;
      service.findById.mockResolvedValue(user);

      await expect(controller.find('1')).resolves.toBe(user);
      expect(service.findById).toHaveBeenCalledWith(1);
    });

    it('throws an error when service fails', async () => {
      service.findById.mockRejectedValue(new Error('Not found'));

      await expect(controller.find('1')).rejects.toThrow('Not found');
    });
  });

  describe('create', () => {
    it('creates and returns a user on success', async () => {
      const dto = { email: 'e', name: 'n', password: 'p' } as CreateUserDto;
      const user = { id: 2 } as User;
      service.create.mockResolvedValue(user);

      await expect(controller.create(dto)).resolves.toBe(user);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('throws an error when service fails', async () => {
      const dto = { email: 'e', name: 'n', password: 'p' } as CreateUserDto;
      service.create.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(dto)).rejects.toThrow('Creation failed');
    });
  });
});
