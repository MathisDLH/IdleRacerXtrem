import { UserService } from "./user.service";
import { User } from "./user.entity";
import { CreateUserDto } from "../dto/user/create-user.dto";
import { Unit } from "../shared/shared.model";

describe("UserService", () => {
  let service: UserService;
  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  } as any;
  const mockUserUpgradeRepository = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(mockUserRepository, mockUserUpgradeRepository);
  });

  describe("findById", () => {
    it("returns user when found", async () => {
      const user = { id: 1 } as User;
      mockUserRepository.findOne.mockResolvedValue(user);
      const result = await service.findById(1);
      expect(result).toBe(user);
    });

    it("returns null when user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await service.findById(42);
      expect(result).toBeNull();
    });
  });

  describe("findByName", () => {
    it("returns user when found", async () => {
      const user = { id: 1, name: "Alice" } as unknown as User;
      mockUserRepository.findOne.mockResolvedValue(user);
      const result = await service.findByName("Alice");
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { name: "Alice" },
      });
      expect(result).toBe(user);
    });

    it("returns null when user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await service.findByName("Unknown");
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    const dto: CreateUserDto = {
      email: "test@example.com",
      name: "Test",
      password: "password",
    };

    it("creates and saves a user", async () => {
      const savedUser = {
        id: 1,
        ...dto,
        ownedSkins: ["FIRST"],
      } as unknown as User;
      const saveMock = jest.fn().mockResolvedValue(savedUser);
      mockUserRepository.create.mockReturnValue({
        ...dto,
        ownedSkins: ["FIRST"],
        save: saveMock,
      });

      const result = await service.create(dto);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: dto.email,
        name: dto.name,
        password: dto.password,
        ownedSkins: ["FIRST"],
      });
      expect(saveMock).toHaveBeenCalled();
      expect(result).toBe(savedUser);
    });

    it("throws when save fails", async () => {
      const saveMock = jest.fn().mockRejectedValue(new Error("save error"));
      mockUserRepository.create.mockReturnValue({
        ...dto,
        ownedSkins: ["FIRST"],
        save: saveMock,
      });

      await expect(service.create(dto)).rejects.toThrow("save error");
    });
  });

  describe("update", () => {
    it("updates the user and sets updatedAt", async () => {
      const user = { id: 1 } as unknown as User;
      mockUserRepository.save.mockResolvedValue(user);

      const before = Date.now();
      await service.update(user);

      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("throws when save fails", async () => {
      const user = { id: 1 } as unknown as User;
      mockUserRepository.save.mockRejectedValue(new Error("save error"));

      await expect(service.update(user)).rejects.toThrow("save error");
    });
  });

  describe("findUsersByScore", () => {
    it("returns users sorted by score", async () => {
      const users = [
        { id: 1, money_unite: Unit.UNIT, money: 100 } as unknown as User,
        { id: 2, money_unite: Unit.K, money: 50 } as unknown as User,
        { id: 3, money_unite: Unit.K, money: 200 } as unknown as User,
      ];
      mockUserRepository.find.mockResolvedValue([...users]);

      const result = await service.findUsersByScore();

      expect(mockUserRepository.find).toHaveBeenCalledWith({});
      expect(result).toEqual([
        users[2], // money_unite 2, money 200
        users[1], // money_unite 2, money 50
        users[0], // money_unite 1, money 100
      ]);
    });

    it("throws when repository fails", async () => {
      mockUserRepository.find.mockRejectedValue(new Error("db error"));

      await expect(service.findUsersByScore()).rejects.toThrow(
        "Erreur lors de la récupération des utilisateurs triés par score.",
      );
    });
  });
});
