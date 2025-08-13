import { IoAdapter } from "@nestjs/platform-socket.io";
import { INestApplicationContext, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Server, ServerOptions } from "socket.io";
import { UserSocket } from "../game/game.gateway";
import { ConfigService } from "@nestjs/config";

type BearerToken = `Bearer ${string}`;

function extractBearer(tokenLike?: unknown): string | null {
  if (typeof tokenLike !== "string") return null;
  const parts = tokenLike.split(" ");
  return parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;
}

export class CustomIoAdapter extends IoAdapter {
  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: Partial<ServerOptions>): Server {
    const jwtService = this.app.get(JwtService);
    const jwtSecret = this.app.get(ConfigService).get<string>("JWT_SECRET")!;
    const logger = new Logger(CustomIoAdapter.name);
    const server: Server = super.createIOServer(port, options);

    server.use((socket: UserSocket, next) => {
      try {
        const headerAuth = socket.handshake.headers?.authorization as
          | BearerToken
          | undefined;

        const rawAuth = (
          socket.handshake.auth as Record<string, unknown> | undefined
        )?.token as BearerToken | undefined;

        const headerToken = extractBearer(headerAuth);
        const fieldToken = extractBearer(rawAuth);
        const token = headerToken ?? fieldToken;

        if (!token) {
          throw new Error("Missing or invalid token");
        }

        const payload = jwtService.verify(token, {
          secret: jwtSecret,
        });
        socket.userId = payload.userId;
        next();
      } catch (err: unknown) {
        const message =
          typeof err === "object" &&
          err &&
          "name" in err &&
          (err as { name: string }).name === "TokenExpiredError"
            ? "TOKEN_EXPIRED"
            : "UNAUTHORIZED";

        logger.error(err instanceof Error ? err : new Error(String(err)));
        next(new Error(message));
      }
    });

    return server;
  }
}
