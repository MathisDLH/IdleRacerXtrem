import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';
import { RedisService } from 'src/redis/redis.service';
import { JsonWebTokenError } from 'jsonwebtoken';

interface UserSocket extends Socket {
  user?: User;
}

@WebSocketGateway({cors: {origin: '*'}})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  clients: Set<UserSocket> = new Set();

  constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService, private readonly redisService: RedisService) {
    setInterval(async () => {
      this.clients.forEach(async (client) => {
        if (client.user) {
          await this.updateMoney(client.user);
          client.emit('money', await this.redisService.getUserData(client.user));
        }
      });
    }, 1000);
  }
  
  @SubscribeMessage('click')
  async handleClick(client: UserSocket): Promise<void> {
    this.redisService.incrMoney(client.user.id.toString(), "1");
    client.emit('money', await this.redisService.getUserData(client.user));
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
      this.redisService.loadUserInRedis(client.user);
      console.log('New client connected');
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        console.error('Erreur de vérification JWT:', err.message);
      } else {
        console.error(err);
      }
      client.disconnect();
    }
  }

  handleDisconnect(client: UserSocket) {
    console.log('Client disconnected', client.id);
    this.clients.delete(client);
  }


  
  async updateMoney(user: User): Promise<void> {
    var redisInfos = await this.redisService.getUserData(user);
    if (redisInfos.upgrades.length > 0) {
      redisInfos.upgrades.forEach(element => {
        if(element.id > 1){
            redisInfos.upgrades.find((upgrade) => upgrade.id == element.generationUpgradeId).amount = element.amount * element.value;
            element.amount = 0;
        }else{
          redisInfos.money = (element.amount * element.value);
          console.log(redisInfos)
  
        } 
      });
      await this.redisService.updateUserData(user, redisInfos);   
    }
  }

  async getUserMoney(user: User): Promise<string> {
    var redisInfos = await this.redisService.getUserData(user);
    return redisInfos.money.toString() + redisInfos.moneyUnit.toString();
  }
}