import {Body, Controller, Logger, Post, UseFilters} from "@nestjs/common";
import {AccessToken, Login, Register} from "./auth.model";
import {AuthService} from "./auth.service";
import {User} from "../user/user.entity";
import {TypeormExceptionFilter} from "../filters/typeormException.filter";
import {ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller('auth')
export class AuthController {
    constructor(private readonly service: AuthService) {
    }

    private readonly logger: Logger = new Logger(AuthController.name);

    @Post("/login")
    @ApiResponse({
        status: 200,
        description: 'access token generated',
        type: AccessToken,
    })
    async login(@Body() payload: Login): Promise<AccessToken> {
        this.logger.log(`CALL login with name: ${payload.name}`);
        const accessToken: AccessToken = await this.service.login(payload);
        this.logger.log(`OK login`);
        return accessToken;
    }

    @Post("/register")
    @ApiResponse({
        status: 200,
        description: 'the new user created',
        type: User,
    })
    @UseFilters(new TypeormExceptionFilter())
    async register(@Body() payload: Register): Promise<User> {
        this.logger.log(`CALL register with name: ${payload.name}, mail: ${payload.email}`);
        const response: User = await this.service.register(payload);
        this.logger.log(`OK register`);
        return response;
    }
}