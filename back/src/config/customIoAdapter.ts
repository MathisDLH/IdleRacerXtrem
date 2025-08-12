import {IoAdapter} from "@nestjs/platform-socket.io";
import {INestApplicationContext, Logger} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {Server} from "socket.io";
import {UserSocket} from "../game/game.gateway";
import {ConfigService} from "@nestjs/config";

export class CustomIoAdapter extends IoAdapter {
    constructor(
        private app: INestApplicationContext
    ) {
        super(app);
    }

    createIOServer(port: number, options?: any): any {
        const jwtService: JwtService = this.app.get(JwtService);
        const jwtsecret:string = this.app.get(ConfigService).get('JWT_SECRET');
        const logger = new Logger(CustomIoAdapter.name);
        const server: Server = super.createIOServer(port, options);



        server.use((socket: UserSocket, next) => {
            try {
                const authHeader = socket.handshake.headers?.authorization as string | undefined;
                if (!authHeader) {
                    throw new Error('Missing Authorization header');
                }
                const parts = authHeader.split(' ');
                if (parts.length !== 2 || parts[0] !== 'Bearer') {
                    throw new Error('Invalid Authorization header format');
                }
                const token = parts[1];
                const payload = jwtService.verify(token, {
                    secret: jwtsecret,
                });
                socket.userId = payload.userId;
                next();
            } catch (e) {
                logger.error(e);
                next(new Error());
            }
        })
        return server;
    }
}