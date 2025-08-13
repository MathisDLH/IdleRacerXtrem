import { redisProvider } from '../../src/redis/redis.provider';
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

describe('redisProvider retry strategies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports a client with retry and reconnect strategies', () => {
    const client = (redisProvider as any).useFactory();

    expect(Redis).toHaveBeenCalledWith(
      expect.objectContaining({
        retryStrategy: expect.any(Function),
        reconnectOnError: expect.any(Function),
      }),
    );

    const options = (Redis as unknown as jest.Mock).mock.calls[0][0];

    expect(options.retryStrategy(5)).toBe(250);
    expect(options.retryStrategy(100)).toBe(2000);
    expect(options.reconnectOnError(new Error('boom'))).toBe(true);

    expect(client.options.retryStrategy).toBe(options.retryStrategy);
    expect(client.options.reconnectOnError).toBe(options.reconnectOnError);
  });
});

