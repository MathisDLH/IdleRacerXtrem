import { DataSourceOptions } from 'typeorm';

describe('data-source config', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('builds DataSource using environment variables', async () => {
    process.env.DATABASE_HOST = 'db';
    process.env.DATABASE_PORT = '5555';
    process.env.DATABASE_USER = 'user';
    process.env.DATABASE_PASSWORD = 'pass';
    process.env.DATABASE_NAME = 'name';

    const { AppDataSource } = await import('./data-source');
    const opts: any = AppDataSource.options as DataSourceOptions;

    expect(opts).toMatchObject({
      type: 'mysql',
      host: 'db',
      port: 5555,
      username: 'user',
      password: 'pass',
      database: 'name',
      synchronize: true,
    });
  });

  it('falls back to defaults when env vars missing', async () => {
    delete process.env.DATABASE_HOST;
    delete process.env.DATABASE_PORT;
    delete process.env.DATABASE_USER;
    delete process.env.DATABASE_PASSWORD;
    delete process.env.DATABASE_NAME;

    const { AppDataSource } = await import('./data-source');
    const opts: any = AppDataSource.options as DataSourceOptions;

    expect(opts.host).toBe('localhost');
    expect(opts.port).toBe(3306);
  });
});
