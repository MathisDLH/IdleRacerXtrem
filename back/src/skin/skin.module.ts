import {Module} from '@nestjs/common';

import {SkinService} from './skin.service';
import {SkinController} from './skin.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Skin} from "./skin.entity";
import {User} from "../user/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Skin])],
  controllers: [SkinController],
  providers: [SkinService],
  exports: [SkinService]
})
export class SkinModule {}