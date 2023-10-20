import {Module} from '@nestjs/common';

import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {UserUpgrade} from "../UserUpgrade/userUpgrade.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([UserUpgrade])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}