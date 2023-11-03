import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {UserService} from 'src/user/user.service';
import {User} from 'src/user/user.entity';
import {RedisService} from 'src/redis/redis.service';
import {Logger} from "@nestjs/common";


export interface UserSocket extends Socket {
    userId: string;
    user?: User;
}

@WebSocketGateway({cors: {origin: '*'}})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    socketConnected: Set<UserSocket> = new Set();

    private readonly logger: Logger = new Logger(GameGateway.name)

    constructor(private readonly userService: UserService,
                private readonly redisService: RedisService) {
        setInterval(async () => {
            this.socketConnected.forEach(async (client) => {
                if (client) {
                    await this.updateMoney(client.user);
                    client.emit('money', await this.redisService.getUserData(client.user));
                }
            });
        }, 1000);


        setInterval(async () => {
            this.socketConnected.forEach(async (client) => {
                if (client) {
                    this.pushRedisToDb(client.user);
                }
            });
        }, 10000);
    }

    @SubscribeMessage('click')
    async handleClick(client: UserSocket): Promise<void> {
        this.redisService.incrMoney(client.user.id.toString(), "1");
        client.emit('money', await this.redisService.getUserData(client.user));
    }


    async handleConnection(client: UserSocket) {
        //CHECK HERE IS USERID ALREADY EXIST ?
        this.logger.log(`${client.userId} connected`);
        this.userService.findById(+client.userId).then(user => {
            client.user = user;
            this.socketConnected.add(client);
            this.redisService.loadUserInRedis(user);
        });
    }

    handleDisconnect(client: UserSocket) {
        this.logger.log(`${client.userId} disconnect`);
        this.pushRedisToDb(client.user);
        this.socketConnected.delete(client);
    }


    async updateMoney(user: User): Promise<void> {
        const redisInfos = await this.redisService.getUserData(user);
        if (redisInfos.upgrades.length > 0) {
            redisInfos.upgrades.forEach(element => {
                if (element.id > 1) {
                    redisInfos.upgrades.find((upgrade) => upgrade.id == element.generationUpgradeId).amount = element.amount * element.value;
                    element.amount = 0;
                } else {
                    redisInfos.money = (element.amount * element.value);

                }
            });
            await this.redisService.updateUserData(user, redisInfos);
        }
    }

    async pushRedisToDb(user: User) {
        const redisInfos = await this.redisService.getUserData(user);
        const newUser = {...user, money: redisInfos.money};
        await this.userService.update(newUser as User);
    }
    async getUserMoney(user: User): Promise<string> {
        const redisInfos = await this.redisService.getUserData(user);
        return redisInfos.money.toString() + redisInfos.moneyUnit.toString();
    }
}