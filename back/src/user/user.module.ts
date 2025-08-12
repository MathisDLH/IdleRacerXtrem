import {Module} from '@nestjs/common';

import {UserService} from './user.service';
import {UsersController} from './user.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {UserUpgrade} from "../UserUpgrade/userUpgrade.entity";
import {RedisService} from "../redis/redis.service";
import {redisProvider} from "../redis/redis.provider";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserUpgrade])],
  controllers: [UsersController],
  providers: [UserService,redisProvider,RedisService],
  exports: [UserService]
})
export class UserModule {}