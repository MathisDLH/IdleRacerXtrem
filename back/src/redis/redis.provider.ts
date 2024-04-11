import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export type RedisClient = Redis;

export const redisProvider: Provider = {
    useFactory: (): RedisClient => {
        return new Redis({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT)
        });
    },
    provide: 'REDIS_CLIENT',
};