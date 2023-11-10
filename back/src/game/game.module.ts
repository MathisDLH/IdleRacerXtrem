import {Module} from "@nestjs/common";
import {GameGateway} from "./game.gateway";
import {UserService} from "../user/user.service";
import {UpgradeService} from "../upgrade/upgrade.service";
import {RedisService} from "../redis/redis.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../user/user.entity";
import {UserUpgrade} from "../UserUpgrade/userUpgrade.entity";
import {Upgrade} from "../upgrade/upgrade.entity";
import {RedisModule} from "../redis/redis.module";


@Module({
    imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([UserUpgrade]),TypeOrmModule.forFeature([Upgrade]), RedisModule],
    providers: [GameGateway, UserService, UpgradeService,RedisService],
    exports: [GameGateway]
})
export class GameModule {
}