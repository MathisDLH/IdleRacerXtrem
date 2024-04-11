import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {User} from './user/user.entity';
import {GameGateway} from './game/game.gateway';
import {JwtModule} from '@nestjs/jwt';
import {Upgrade} from "./upgrade/upgrade.entity";
import {UserUpgrade} from "./UserUpgrade/userUpgrade.entity";
import {RedisModule} from "./redis/redis.module";
import {UpgradeModule} from "./upgrade/upgrade.module";
import {SeedingService} from './seeding/seeding.service';
import {Skin} from "./skin/skin.entity";
import {SkinModule} from "./skin/skin.module";
import {GameModule} from "./game/game.module";

const entities = [User, Upgrade, UserUpgrade, Skin];

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env'],
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            socketPath: process.env.INSTANCE_UNIX_SOCKET,
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            entities: entities,
            synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Upgrade]),
        TypeOrmModule.forFeature([Skin]),
        UserModule,
        SkinModule,
        AuthModule,
        GameModule,
        JwtModule,
        RedisModule,
        UpgradeModule,
    ],
    providers: [SeedingService],
})
export class AppModule {
}