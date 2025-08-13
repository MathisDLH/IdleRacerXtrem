import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';

describe('AuthModule', () => {
  it('should configure JwtModule with default expiration when JWT_EXPIRES_IN is missing', async () => {
    const imports = Reflect.getMetadata('imports', AuthModule) || [];
    const jwtModule = imports.find(
      (i: any) => i?.module && i.module.name === 'JwtModule',
    );
    expect(jwtModule).toBeDefined();

    const provider = jwtModule.providers.find(
      (p: any) => p.provide === 'JWT_MODULE_OPTIONS',
    );
    expect(provider).toBeDefined();

    const configService: Partial<ConfigService> = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'JWT_SECRET') return 'secret';
        return defaultValue;
      }),
    };

    const options = await provider.useFactory(configService as ConfigService);

    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    expect(configService.get).toHaveBeenCalledWith('JWT_EXPIRES_IN', '3600s');
    expect(options).toEqual({
      secret: 'secret',
      signOptions: { expiresIn: '3600s' },
    });
  });
});
