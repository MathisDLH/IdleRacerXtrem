import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { HttpException, HttpStatus } from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: any;
  let jwtService: any;
  let configService: any;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === "JWT_REFRESH_EXPIRES_IN") return "7d";
        if (key === "JWT_SECRET") return "secret";
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("login returns tokens", async () => {
    const user = { id: 1 } as User;
    jest.spyOn(service, "validateUser").mockResolvedValue(user);
    jwtService.sign
      .mockReturnValueOnce("access")
      .mockReturnValueOnce("refresh");

    const result = await service.login({ name: "john", password: "pwd" });

    expect(service.validateUser).toHaveBeenCalledWith({
      name: "john",
      password: "pwd",
    });
    expect(jwtService.sign).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      access_token: "access",
      refresh_token: "refresh",
    });
  });

  it("login throws when validateUser fails", async () => {
    jest
      .spyOn(service, "validateUser")
      .mockRejectedValue(new HttpException("Invalid", HttpStatus.UNAUTHORIZED));
    await expect(
      service.login({ name: "john", password: "pwd" }),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it("refresh returns new access token", async () => {
    jwtService.verify.mockReturnValue({ userId: 1 });
    jwtService.sign.mockReturnValue("newAccess");

    const result = await service.refresh("oldToken");

    expect(jwtService.verify).toHaveBeenCalledWith("oldToken", {
      secret: "secret",
    });
    expect(result).toEqual({ access_token: "newAccess" });
  });

  it("refresh throws on invalid token", async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error("bad");
    });
    await expect(service.refresh("bad")).rejects.toThrow(
      "Invalid refresh token",
    );
  });

  it("register creates and saves user", async () => {
    const payload = { name: "john", email: "john@test", password: "pwd" };
    const saved = { id: 1, ...payload, ownedSkins: ["FIRST"] } as User;
    const save = jest.fn().mockResolvedValue(saved);
    userRepository.create.mockReturnValue({
      ...payload,
      ownedSkins: ["FIRST"],
      save,
    });

    const result = await service.register(payload);

    expect(userRepository.create).toHaveBeenCalledWith({
      name: "john",
      email: "john@test",
      password: "pwd",
      ownedSkins: ["FIRST"],
    });
    expect(save).toHaveBeenCalled();
    expect(result).toBe(saved);
  });

  it("register propagates save errors", async () => {
    const payload = { name: "john", email: "john@test", password: "pwd" };
    const save = jest.fn().mockRejectedValue(new Error("fail"));
    userRepository.create.mockReturnValue({
      ...payload,
      ownedSkins: ["FIRST"],
      save,
    });

    await expect(service.register(payload)).rejects.toThrow("fail");
  });

  it("validateUser returns user when credentials valid", async () => {
    const user = {
      id: 1,
      name: "john",
      password: "hash",
      validatePassword: jest.fn().mockResolvedValue(true),
    } as any;
    userRepository.findOne.mockResolvedValue(user);

    const result = await service.validateUser({
      name: "john",
      password: "pwd",
    });

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { name: "john" },
      select: ["id", "name", "password"],
    });
    expect(user.validatePassword).toHaveBeenCalledWith("pwd");
    expect(result).toBe(user);
  });

  it("validateUser throws when user not found", async () => {
    userRepository.findOne.mockResolvedValue(null);
    await expect(
      service.validateUser({ name: "john", password: "pwd" }),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it("validateUser throws when password invalid", async () => {
    const user = {
      validatePassword: jest.fn().mockResolvedValue(false),
    } as any;
    userRepository.findOne.mockResolvedValue(user);
    await expect(
      service.validateUser({ name: "john", password: "pwd" }),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
