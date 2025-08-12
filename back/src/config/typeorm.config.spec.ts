import { ConfigService } from '@nestjs/config';
import { getTypeOrmModuleOptions } from './typeorm.config';

describe('getTypeOrmModuleOptions', () => {
  const mockConfig = new Map<string, string>();
  const configService = {
    get: jest.fn((key: string, defaultValue?: string) =>
      mockConfig.has(key) ? mockConfig.get(key) : defaultValue,
    ),
  } as unknown as ConfigService;

  beforeEach(() => {
    mockConfig.clear();
  });

  it('creates options from ConfigService values', () => {
    mockConfig.set('DATABASE_HOST', 'host');
    mockConfig.set('DATABASE_PORT', '1234');
    mockConfig.set('DATABASE_USER', 'user');
    mockConfig.set('DATABASE_PASSWORD', 'pass');
    mockConfig.set('DATABASE_NAME', 'db');

    const opts: any = getTypeOrmModuleOptions(configService);
    expect(opts).toMatchObject({
      type: 'mysql',
      host: 'host',
      port: 1234,
      username: 'user',
      password: 'pass',
      database: 'db',
      synchronize: true,
    });
  });

  it('uses defaults when ConfigService lacks values', () => {
    const opts: any = getTypeOrmModuleOptions(configService);
    expect(opts.host).toBe('localhost');
    expect(opts.port).toBe(3306);
  });
});
