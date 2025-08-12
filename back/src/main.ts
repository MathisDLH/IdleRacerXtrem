import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { CustomIoAdapter } from "./config/customIoAdapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix("api");

  app.useGlobalPipes(new ValidationPipe());

  const adapter = new CustomIoAdapter(app);

  app.useWebSocketAdapter(adapter);

  const config = new DocumentBuilder()
    .setTitle("IdleRacerXtrem API")
    .setDescription("API for the IdleRacerXtrem application")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}

bootstrap();
