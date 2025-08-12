import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user/user.entity";
import { Upgrade } from "./upgrade/upgrade.entity";
import { UserUpgrade } from "./UserUpgrade/userUpgrade.entity";
import { Skin } from "./skin/skin.entity";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { GameModule } from "./game/game.module";
import { RedisModule } from "./redis/redis.module";
import { UpgradeModule } from "./upgrade/upgrade.module";
import { SkinModule } from "./skin/skin.module";
import { SeedingService } from "./seeding/seeding.service";
import { getTypeOrmModuleOptions } from "./config/typeorm.config";

const entities = [User, Upgrade, UserUpgrade, Skin];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env"],
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getTypeOrmModuleOptions(configService),
    }),
    // Required for repositories injected in SeedingService
    TypeOrmModule.forFeature([Upgrade, Skin]),
    UserModule,
    SkinModule,
    AuthModule,
    GameModule,
    RedisModule,
    UpgradeModule,
  ],
  providers: [SeedingService],
})
export class AppModule {}
