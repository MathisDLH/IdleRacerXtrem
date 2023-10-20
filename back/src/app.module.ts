import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { HealthModule } from './health/health.module';
import { GameGateway } from './game/game.gateway';
import { JwtModule } from '@nestjs/jwt';
import { Upgrade } from "./upgrade/upgrade.entity";
import {UserUpgrade} from "./UserUpgrade/userUpgrade.entity";

const entities = [User, Upgrade, UserUpgrade];
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: entities,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
    AuthModule,
    HealthModule,
    JwtModule,
  ],
  controllers: [AppController],
  providers: [AppService, GameGateway],
})
export class AppModule {}