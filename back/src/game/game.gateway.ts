import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';

interface UserSocket extends Socket {
  user?: User;
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
          client.emit('money', await this.getUserMoney(client.user));
        }
      });
    }, 1000);
  }
  
  @SubscribeMessage('click')
  handleClick(client: UserSocket, payload: any): void {
    console.log('Click event received');
  }

  async handleConnection(client: UserSocket) {
    let token = client.handshake.query.token;
    if (Array.isArray(token)) {
      token = token[0];
    }
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      client.user = await this.usersService.findById(parseInt(payload.userId));
      this.clients.add(client);
      console.log('New client connected');
    } catch (err) {
      console.error('Erreur de vérification JWT:', err);
      client.disconnect();
    }

  }

  handleDisconnect(client: UserSocket) {
    console.log('Client disconnected', client.id);
    this.clients.delete(client);
  }
  async getUserMoney(user: User): Promise<string> {

    //Algo de calcul de l'argent à virer et des quantités à mettre à jour.
    /*var redisInfos = getRedisInfos(User);
    var actualMoney = redisInfos.money;
    redisInfos.upgrades.forEach(element => {
      
    });*/

    return user.money.toString() + user.money_unite.toString();
  }
}