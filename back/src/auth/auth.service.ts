import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

import {User} from 'src/user/user.entity';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {AccessToken, JWTContent, Login, Register} from "./auth.model";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private jwtService: JwtService
    ) {
    }

    async login(login: Login): Promise<AccessToken> {
        const user = await this.validateUser(login);

        const jwtContent: JWTContent = {
            userId: user.id,
        };

        return {
            access_token: this.jwtService.sign(jwtContent)
        };
    }

    async register(payload: Register): Promise<User> {
        let user: User = this.userRepository.create(
            {
                name: payload.name,
                email: payload.email,
                password: payload.password,
                ownedSkins: ["FIRST"]
            }
        );
        user = await user.save();
        return user;
    }


    async validateUser(payload: Login): Promise<User> {
        const {name, password} = payload;
        const user: User = await this.userRepository.findOne({where: {name}, select: ["id", "name", "password"]});

        if (!user) throw new HttpException("Incorrect username or password", HttpStatus.UNAUTHORIZED);

        const validate = await user.validatePassword(password);

        if(!validate) throw new HttpException("Incorrect username or password", HttpStatus.UNAUTHORIZED);
        return user;
    }
}