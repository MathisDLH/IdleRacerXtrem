import {Body, Controller, Get, Param, Post, Put} from '@nestjs/common';

import {UsersService} from './users.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UserUpgrade} from "../UserUpgrade/userUpgrade.entity";
import {User} from "./user.entity";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("/register")
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  find(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(+id);
  }

  @Put(':id')
  addUpgrade(@Param('id') id: number, @Body() body: {upgradeId: number, amount:number}): Promise<UserUpgrade> {
      return this.usersService.addUpgrade(id, body.upgradeId, body.amount);
  }
}