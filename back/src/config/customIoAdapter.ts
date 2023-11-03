import {IoAdapter} from "@nestjs/platform-socket.io";
import {INestApplicationContext, Logger} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {Server} from "socket.io";
import process from "process";
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
                const token = socket.handshake.headers.authorization.split(' ')[1];
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