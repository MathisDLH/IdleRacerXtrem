import { redisProvider } from "./redis.provider";
import { Logger } from "@nestjs/common";
import Redis from "ioredis";

jest.mock("ioredis", () => {
  const EventEmitter = require("events");
  const mock = jest.fn().mockImplementation((options) => {
    const emitter = new EventEmitter();
    (emitter as any).options = options;
    (emitter as any).triggerError = (err) => {
      if (options.retryStrategy) {
        options.retryStrategy(1);
      }
      if (options.reconnectOnError) {
        options.reconnectOnError(err);
      }
      emitter.emit("error", err);
    };
    return emitter;
  });
  return { __esModule: true, default: mock };
});

describe("redisProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
  });

  it("initializes Redis client and logs on connect", () => {
    process.env.REDIS_HOST = "example.com";
    process.env.REDIS_PORT = "1234";
    const logSpy = jest.spyOn(Logger, "log").mockImplementation(() => {});

    const client = (redisProvider as any).useFactory();

    expect(Redis).toHaveBeenCalledWith({
      host: "example.com",
      port: 1234,
      retryStrategy: expect.any(Function),
      reconnectOnError: expect.any(Function),
    });

    (client as any).emit("connect");
    expect(logSpy).toHaveBeenCalledWith("[Redis] connected");
  });

  it("handles connection errors", () => {
    const errorSpy = jest.spyOn(Logger, "error").mockImplementation(() => {});

    const client = (redisProvider as any).useFactory();
    const err = new Error("fail");
    (client as any).emit("error", err);

    expect(errorSpy).toHaveBeenCalledWith("[Redis] error", err);
  });

  it("retries and reconnects on failure", () => {
    const client = (redisProvider as any).useFactory();
    const options = (Redis as unknown as jest.Mock).mock.calls[0][0];

    const retrySpy = jest.spyOn(options, "retryStrategy");
    const reconnectSpy = jest.spyOn(options, "reconnectOnError");

    expect(options.retryStrategy(1)).toBe(50);
    expect(options.retryStrategy(100)).toBe(2000);
    expect(options.reconnectOnError(new Error("test"))).toBe(true);

    retrySpy.mockClear();
    reconnectSpy.mockClear();

    const err = new Error("boom");
    (client as any).triggerError(err);

    expect(retrySpy).toHaveBeenCalledWith(1);
    expect(reconnectSpy).toHaveBeenCalledWith(err);
  });
});
