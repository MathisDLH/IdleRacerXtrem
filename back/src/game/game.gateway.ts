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
import {IRedisData, Unit} from "../shared/shared.model";
import {UpgradeService} from "../upgrade/upgrade.service";


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
                private readonly upgradeService: UpgradeService,
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
        this.redisService.incrMoney(client.user.id, 1,Unit.UNIT);
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
                  let generatedUpgrade =  redisInfos.upgrades.find((upgrade) => upgrade.id == element.generationUpgradeId);
                  generatedUpgrade.amount =  element.amount * element.value;
                  generatedUpgrade.amountUnit =  element.amountUnit;
                } else { // Fan
                    redisInfos.money = (element.amount * element.value);
                    redisInfos.moneyUnit = element.amountUnit
                }
                element.amount = 0;
            });
            await this.redisService.updateUserData(user, redisInfos);
        }
    }

    async pushRedisToDb(user: User) {
        const redisInfos: IRedisData = await this.redisService.getUserData(user);
        console.log(redisInfos)
        const newUser = {id: user.id, money: redisInfos.money, money_unite: redisInfos.moneyUnit };
        const upgrades = redisInfos.upgrades;
        await this.userService.update(newUser as User);
        for (const upgrade of upgrades) {
            await this.upgradeService.updateById(user.id, upgrade.id, upgrade.amount, upgrade.amountUnit, upgrade.amountBought);
        }

    }
}