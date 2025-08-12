import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";

import { UserService } from "./user.service";
import { User } from "./user.entity";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "../dto/user/create-user.dto";

@ApiTags("User")
@Controller(["user", "users"])
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get("/scores")
  findScoreTab(): Promise<User[]> {
    return this.usersService.findUsersByScore();
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "Retrieve user data",
    type: User,
  })
  find(@Param("id") id: string): Promise<User> {
    return this.usersService.findById(+id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiResponse({
    status: 201,
    description: "Create a new user",
    type: User,
  })
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }
}
