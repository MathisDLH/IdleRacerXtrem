import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';

import { UserService } from './user.service';
import { User } from "./user.entity";
import { RedisService } from "../redis/redis.service";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("User")
@Controller(['user','users'])
export class UsersController {
  constructor(private readonly usersService: UserService,
    private readonly redisService: RedisService) { }

  @Get('/scores')
  findScoreTab(): Promise<User[]> {
    return this.usersService.findUsersByScore();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Retrieve user data',
    type: User,
  })
  find(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(+id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiResponse({
    status: 201,
    description: 'Create a new user',
    type: User,
  })
  create(@Body() dto: import('../dto/user/create-user.dto').CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }

}