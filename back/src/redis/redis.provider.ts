import { Provider } from "@nestjs/common";
import Redis from "ioredis";

export type RedisClient = Redis;

export const redisProvider: Provider = {
  useFactory: (): RedisClient => {
    const client = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      retryStrategy: (times) => Math.min(times * 50, 2000),
      reconnectOnError: () => true,
    });
    client.on("connect", () => {
      // eslint-disable-next-line no-console
      console.log("[Redis] connected");
    });
    client.on("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("[Redis] error", err);
    });
    return client;
  },
  provide: "REDIS_CLIENT",
};
