import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('fails to initialize with invalid database configuration', async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => {
          if (key === 'DATABASE_PORT') {
            return 'not-a-number';
          }
          return undefined;
        },
      });

    await expect(moduleBuilder.compile()).rejects.toThrow(
      'Invalid database configuration',
    );
  });
});
