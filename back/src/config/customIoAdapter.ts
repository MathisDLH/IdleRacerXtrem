import { IoAdapter } from "@nestjs/platform-socket.io";
import { INestApplicationContext, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Server } from "socket.io";
import { UserSocket } from "../game/game.gateway";
import { ConfigService } from "@nestjs/config";

export class CustomIoAdapter extends IoAdapter {
  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const jwtService: JwtService = this.app.get(JwtService);
    const jwtsecret: string = this.app.get(ConfigService).get("JWT_SECRET");
    const logger = new Logger(CustomIoAdapter.name);
    const server: Server = super.createIOServer(port, options);

    server.use((socket: UserSocket, next) => {
      try {
        // Support either Authorization header or Socket.IO auth field
        const authHeader = socket.handshake.headers?.authorization as
          | string
          | undefined;
        const authField = (socket.handshake as any)?.auth?.token as
          | string
          | undefined;

        let token: string | undefined;
        if (authHeader) {
          const parts = authHeader.split(" ");
          if (parts.length === 2 && parts[0] === "Bearer") {
            token = parts[1];
          }
        } else if (authField) {
          const parts = authField.split(" ");
          if (parts.length === 2 && parts[0] === "Bearer") {
            token = parts[1];
          }
        }

        if (!token) {
          throw new Error("Missing or invalid token");
        }
        const payload = jwtService.verify(token, {
          secret: jwtsecret,
        });
        socket.userId = payload.userId;
        next();
      } catch (e: any) {
        logger.error(e);
        if (e?.name === "TokenExpiredError") {
          next(new Error("TOKEN_EXPIRED"));
        } else {
          next(new Error("UNAUTHORIZED"));
        }
      }
    });
    return server;
  }
}
