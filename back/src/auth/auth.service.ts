import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { User } from "src/user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AccessToken, JWTContent, Login, Register, Tokens } from "./auth.model";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(login: Login): Promise<Tokens> {
    const user = await this.validateUser(login);

    const jwtContent: JWTContent = {
      userId: user.id,
    };

    const access_token = this.jwtService.sign(jwtContent);
    const refresh_token = this.jwtService.sign(jwtContent, {
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", "7d"),
    });
    return { access_token, refresh_token };
  }

  async refresh(oldRefreshToken: string): Promise<AccessToken> {
    try {
      const payload = this.jwtService.verify(oldRefreshToken, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });
      const jwtContent: JWTContent = { userId: payload.userId };
      return { access_token: this.jwtService.sign(jwtContent) };
    } catch (e) {
      throw new HttpException("Invalid refresh token", HttpStatus.UNAUTHORIZED);
    }
  }

  async register(payload: Register): Promise<User> {
    let user: User = this.userRepository.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      ownedSkins: ["FIRST"],
    });
    user = await user.save();
    return user;
  }

  async validateUser(payload: Login): Promise<User> {
    const { name, password } = payload;
    const user: User = await this.userRepository.findOne({
      where: { name },
      select: ["id", "name", "password"],
    });

    if (!user)
      throw new HttpException(
        "Incorrect username or password",
        HttpStatus.UNAUTHORIZED,
      );

    const validate = await user.validatePassword(password);

    if (!validate)
      throw new HttpException(
        "Incorrect username or password",
        HttpStatus.UNAUTHORIZED,
      );
    return user;
  }
}
