import {Module} from '@nestjs/common';

import {TypeOrmModule} from "@nestjs/typeorm";
import {UserUpgrade} from "../UserUpgrade/userUpgrade.entity";
import { UpgradeService } from './upgrade.service';
import { UpgradeController } from './upgrade.controller';
import { Upgrade } from './upgrade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Upgrade]), TypeOrmModule.forFeature([UserUpgrade])],
  controllers: [UpgradeController],
  providers: [UpgradeService,],
  exports: [UpgradeService]
})
export class UpgradeModule {}