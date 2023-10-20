import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

interface UserPayload {
  userId: string;
}

interface UserSocket extends Socket {
  user?: UserPayload;
}

@WebSocketGateway({
    cors: {
      origin: '*',
    }
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  clients: Set<UserSocket> = new Set();

  constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService) {
    setInterval(async () => {
      this.clients.forEach(async (client) => {
        if (client.user) {
          client.emit('money', await this.getUserMoney(parseInt(client.user.userId)));
        }
      });
    }, 1000);
  }
  

  handleConnection(client: UserSocket) {
    let token = client.handshake.query.token;
    if (Array.isArray(token)) {
      token = token[0];
    }
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      // Vérifiez le token
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      client.user = payload;
      console.log('New client connected');
      this.clients.add(client);
    } catch (err) {
      console.error('Erreur de vérification JWT:', err);
      client.disconnect();
    }

  }

  handleDisconnect(client: UserSocket) {
    console.log('Client disconnected', client.id);
    this.clients.delete(client);
  }
  async getUserMoney(userId: number): Promise<string> {
    const user = await this.usersService.findById(userId);
    console.log(user.money + user.money_unite);
    return user.money + user.money_unite;
  }
}
