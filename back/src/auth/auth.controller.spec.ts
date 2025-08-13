import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User } from "../user/user.entity";

describe("AuthController", () => {
  let controller: AuthController;
  const mockAuthService = {
    login: jest.fn(),
    refresh: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("login delegates to service and returns tokens", async () => {
    const dto = { name: "john", password: "pwd" };
    const tokens = { access_token: "a", refresh_token: "r" };
    mockAuthService.login.mockResolvedValue(tokens);

    const result = await controller.login(dto);

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(result).toBe(tokens);
  });

  it("refresh delegates to service and returns access token", async () => {
    const token = { access_token: "new" };
    mockAuthService.refresh.mockResolvedValue(token);

    const result = await controller.refresh({ refresh_token: "old" });

    expect(mockAuthService.refresh).toHaveBeenCalledWith("old");
    expect(result).toBe(token);
  });

  it("register delegates to service and returns user", async () => {
    const payload = { name: "john", email: "john@test", password: "pwd" };
    const user = { id: 1, ...payload } as User;
    mockAuthService.register.mockResolvedValue(user);

    const result = await controller.register(payload);

    expect(mockAuthService.register).toHaveBeenCalledWith(payload);
    expect(result).toBe(user);
  });
});
