import {Module} from '@nestjs/common';

import {TypeOrmModule} from "@nestjs/typeorm";
import {UserUpgrade} from "../UserUpgrade/userUpgrade.entity";
import {UpgradeService} from './upgrade.service';
import {UpgradeController} from './upgrade.controller';
import {Upgrade} from './upgrade.entity';
import {RedisService} from "../redis/redis.service";
import {redisProvider} from "../redis/redis.provider";
import {GameModule} from "../game/game.module";

@Module({
  imports: [TypeOrmModule.forFeature([Upgrade, UserUpgrade]), GameModule],
  controllers: [UpgradeController],
  providers: [UpgradeService,redisProvider, RedisService],
  exports: [UpgradeService]
})
export class UpgradeModule {}