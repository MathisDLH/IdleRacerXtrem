import { redisProvider } from './redis.provider';
import { Logger } from '@nestjs/common';
import Redis from 'ioredis';

jest.mock('ioredis', () => {
  const EventEmitter = require('events');
  const mock = jest.fn().mockImplementation((options) => {
    const emitter = new EventEmitter();
    (emitter as any).options = options;
    return emitter;
  });
  return { __esModule: true, default: mock };
});

describe('redisProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
  });

  it('initializes Redis client and logs on connect', () => {
    process.env.REDIS_HOST = 'example.com';
    process.env.REDIS_PORT = '1234';
    const logSpy = jest.spyOn(Logger, 'log').mockImplementation(() => {});

    const client = (redisProvider as any).useFactory();

    expect(Redis).toHaveBeenCalledWith({
      host: 'example.com',
      port: 1234,
      retryStrategy: expect.any(Function),
      reconnectOnError: expect.any(Function),
    });

    (client as any).emit('connect');
    expect(logSpy).toHaveBeenCalledWith('[Redis] connected');
  });

  it('handles connection errors', () => {
    const errorSpy = jest
      .spyOn(Logger, 'error')
      .mockImplementation(() => {});

    const client = (redisProvider as any).useFactory();
    const err = new Error('fail');
    (client as any).emit('error', err);

    expect(errorSpy).toHaveBeenCalledWith('[Redis] error', err);
  });
});
