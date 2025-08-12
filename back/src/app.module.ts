import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Upgrade } from './upgrade/upgrade.entity';
import { UserUpgrade } from './UserUpgrade/userUpgrade.entity';
import { Skin } from './skin/skin.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { RedisModule } from './redis/redis.module';
import { UpgradeModule } from './upgrade/upgrade.module';
import { SkinModule } from './skin/skin.module';
import { SeedingService } from './seeding/seeding.service';

const entities = [User, Upgrade, UserUpgrade, Skin];

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env'],
            isGlobal: true,
        }),

        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            entities,
            synchronize: true,
        }),

        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Upgrade]),
        TypeOrmModule.forFeature([Skin]),
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
