import {Controller, Get, Param} from '@nestjs/common';

import {UserService} from './user.service';
import {User} from "./user.entity";
import {RedisService} from "../redis/redis.service";
import {ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags("User")
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UserService,
              private readonly redisService: RedisService) {}

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Retrieve user data',
    type: User,
  })
  find(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(+id);
  }

  
  @Get('/scores')
  findScoreTab(): Promise<User[]> {
    return this.usersService.findUsersByScore();
  }
}