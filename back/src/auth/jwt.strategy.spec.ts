import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('should validate payload and return user data', async () => {
    process.env.JWT_SECRET = 'test-secret';
    const strategy = new JwtStrategy();
    await expect(strategy.validate({ userId: 42 })).resolves.toEqual({
      userId: 42,
    });
  });
});
