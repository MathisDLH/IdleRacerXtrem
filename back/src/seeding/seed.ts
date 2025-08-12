import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedingService } from './seeding.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedingService = app.get(SeedingService);
  await seedingService.run();
  await app.close();
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-consoles
  console.error('Seeding failed', err);
  process.exit(1);
});


