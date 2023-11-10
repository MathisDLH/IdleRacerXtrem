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


    // Mettre à jour l'argent de l'utilisateur
    async updateMoney(user: User): Promise<void> {
        // Récupérer les informations de l'utilisateur depuis Redis
        const redisInfos = await this.redisService.getUserData(user);
        // Si l'utilisateur a des mises à niveau
        if (redisInfos.upgrades.length > 0) {
            // Parcourir chaque mise à niveau
            redisInfos.upgrades.forEach(element => {

                // Si l'ID de la mise à niveau est supérieur à 1
                if (element.id > 1) {
                  // Trouver la mise à niveau générée
                  let generatedUpgrade =  redisInfos.upgrades.find((upgrade) => upgrade.id == element.generationUpgradeId);
                  // Mettre à jour le montant de la mise à niveau générée
                  generatedUpgrade.amount =  element.amount * element.value;
                  // Mettre à jour l'unité de montant de la mise à niveau générée
                  generatedUpgrade.amountUnit =  element.amountUnit;
                } else { // Fan
                    // Mettre à jour l'argent de l'utilisateur
                    redisInfos.money = (element.amount * element.value);
                    // Mettre à jour l'unité d'argent de l'utilisateur
                    redisInfos.moneyUnit = element.amountUnit
                }
                // Réinitialiser le montant de la mise à niveau
                element.amount = 0;
            });
            // Mettre à jour les informations de l'utilisateur dans Redis
            await this.redisService.updateUserData(user, redisInfos);
        }
    }

    // Pousser les informations de Redis vers la base de données
    async pushRedisToDb(user: User) {
        // Récupérer les informations de l'utilisateur depuis Redis
        const redisInfos: IRedisData = await this.redisService.getUserData(user);
        // Créer un nouvel utilisateur avec les informations récupérées
        const newUser = {id: user.id, money: redisInfos.money, money_unite: redisInfos.moneyUnit };
        // Récupérer les mises à niveau de l'utilisateur
        const upgrades = redisInfos.upgrades;
        // Mettre à jour l'utilisateur dans la base de données
        await this.userService.update(newUser as User);
        // Pour chaque mise à niveau de l'utilisateur
        for (const upgrade of upgrades) {
            // Mettre à jour la mise à niveau dans la base de données
            await this.upgradeService.updateById(user.id, upgrade.id, upgrade.amount, upgrade.amountUnit, upgrade.amountBought);
        }

    }
}