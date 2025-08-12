import {
  Body,
  Controller,
  Logger,
  Post,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AccessToken, Login, Register, Tokens } from "./auth.model";
import { LoginDto } from "src/dto/auth/login.dto";
import { RegisterDto } from "src/dto/auth/register.dto";
import { AuthService } from "./auth.service";
import { User } from "../user/user.entity";
import { TypeormExceptionFilter } from "../filters/typeormException.filter";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly service: AuthService) {}

  private readonly logger: Logger = new Logger(AuthController.name);

  @Post("/login")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiResponse({
    status: 200,
    description: "access token generated",
    type: AccessToken,
  })
  async login(@Body() payload: LoginDto): Promise<Tokens> {
    this.logger.log(`CALL login with name: ${payload.name}`);
    const tokens: Tokens = await this.service.login(payload);
    this.logger.log(`OK login`);
    return tokens;
  }

  @Post("/refresh")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiResponse({
    status: 200,
    description: "access token refreshed",
    type: AccessToken,
  })
  async refresh(@Body() body: { refresh_token: string }): Promise<AccessToken> {
    return this.service.refresh(body.refresh_token);
  }

  @Post("/register")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiResponse({
    status: 200,
    description: "the new user created",
    type: User,
  })
  @UseFilters(new TypeormExceptionFilter())
  async register(@Body() payload: RegisterDto): Promise<User> {
    this.logger.log(
      `CALL register with name: ${payload.name}, mail: ${payload.email}`,
    );
    const response: User = await this.service.register(payload);
    this.logger.log(`OK register`);
    return response;
  }
}
