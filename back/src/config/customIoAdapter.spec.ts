import { CustomIoAdapter } from "./customIoAdapter";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

describe("CustomIoAdapter", () => {
  let adapter: CustomIoAdapter;
  let jwtService: { verify: jest.Mock };
  let configService: { get: jest.Mock };
  let app: { get: jest.Mock };
  let middleware: any;

  beforeEach(() => {
    jwtService = { verify: jest.fn() };
    configService = {
      get: jest.fn((key: string) => {
        if (key === "JWT_SECRET") return "secret";
        return undefined;
      }),
    };
    app = {
      get: jest.fn((type: any) => {
        if (type === JwtService) return jwtService;
        if (type === ConfigService) return configService;
        return null;
      }),
    };
    adapter = new CustomIoAdapter(app as any);
    middleware = undefined;

    jest
      .spyOn(IoAdapter.prototype, "createIOServer")
      .mockReturnValue({ use: jest.fn((fn) => (middleware = fn)) } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("authenticates via Authorization header", () => {
    jwtService.verify.mockReturnValue({ userId: 1 });
    adapter.createIOServer(3000);

    const socket: any = {
      handshake: { headers: { authorization: "Bearer token" } },
    };
    const next = jest.fn();
    middleware(socket, next);

    expect(jwtService.verify).toHaveBeenCalledWith("token", {
      secret: "secret",
    });
    expect(socket.userId).toBe(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("authenticates via handshake auth field", () => {
    jwtService.verify.mockReturnValue({ userId: 2 });
    adapter.createIOServer(3000);

    const socket: any = {
      handshake: { headers: {}, auth: { token: "Bearer token2" } },
    };
    const next = jest.fn();
    middleware(socket, next);

    expect(jwtService.verify).toHaveBeenCalledWith("token2", {
      secret: "secret",
    });
    expect(socket.userId).toBe(2);
    expect(next).toHaveBeenCalledWith();
  });

  it("prefers Authorization header over handshake auth field", () => {
    jwtService.verify.mockReturnValue({ userId: 3 });
    adapter.createIOServer(3000);

    const socket: any = {
      handshake: {
        headers: { authorization: "Bearer token3" },
        auth: { token: "Bearer tokenShouldNotBeUsed" },
      },
    };
    const next = jest.fn();
    middleware(socket, next);

    expect(jwtService.verify).toHaveBeenCalledWith("token3", {
      secret: "secret",
    });
    expect(socket.userId).toBe(3);
    expect(next).toHaveBeenCalledWith();
  });

  it("handles token expiration errors", () => {
    const err: any = new Error("expired");
    err.name = "TokenExpiredError";
    jwtService.verify.mockImplementation(() => {
      throw err;
    });
    adapter.createIOServer(3000);

    const socket: any = {
      handshake: { headers: { authorization: "Bearer token" } },
    };
    const next = jest.fn();
    middleware(socket, next);

    expect(next).toHaveBeenCalledWith(new Error("TOKEN_EXPIRED"));
  });

  it("refuses connection when token is missing in both header and auth", () => {
    adapter.createIOServer(3000);

    const socket: any = { handshake: { headers: {}, auth: {} } };
    const next = jest.fn();
    middleware(socket, next);

    expect(next).toHaveBeenCalledWith(new Error("UNAUTHORIZED"));
  });

  it("refuses connection when token is not a Bearer token", () => {
    adapter.createIOServer(3000);

    const socket: any = {
      handshake: { headers: { authorization: "NotBearer token" }, auth: {} },
    };
    const next = jest.fn();
    middleware(socket, next);

    expect(next).toHaveBeenCalledWith(new Error("UNAUTHORIZED"));
  });

  it("refuses connection when token verification fails", () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error("invalid");
    });
    adapter.createIOServer(3000);

    const socket: any = {
      handshake: { headers: { authorization: "Bearer badtoken" } },
    };
    const next = jest.fn();
    middleware(socket, next);

    expect(next).toHaveBeenCalledWith(new Error("UNAUTHORIZED"));
  });

  it("logs error and returns UNAUTHORIZED for unknown error types", () => {
    const err: any = { foo: "bar" };
    jwtService.verify.mockImplementation(() => {
      throw err;
    });
    adapter.createIOServer(3000);

    const socket: any = {
      handshake: { headers: { authorization: "Bearer token" } },
    };
    const next = jest.fn();
    middleware(socket, next);

    expect(next).toHaveBeenCalledWith(new Error("UNAUTHORIZED"));
  });

  it("uses JWT_SECRET from config", () => {
    configService.get = jest.fn((key: string) => {
      if (key === "JWT_SECRET") return "mySecret";
      return undefined;
    });
    jwtService.verify.mockReturnValue({ userId: 42 });
    adapter.createIOServer(3000);

    const socket: any = {
      handshake: { headers: { authorization: "Bearer token42" } },
    };
    const next = jest.fn();
    middleware(socket, next);

    expect(jwtService.verify).toHaveBeenCalledWith("token42", {
      secret: "mySecret",
    });
    expect(socket.userId).toBe(42);
    expect(next).toHaveBeenCalledWith();
  });
});
