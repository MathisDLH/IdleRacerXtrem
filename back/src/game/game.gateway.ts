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
import {Logger, OnModuleInit} from "@nestjs/common";
import {IRedisData, Unit} from "../shared/shared.model";
import {UpgradeService} from "../upgrade/upgrade.service";


export interface UserSocket extends Socket {
    userId: string;
    user?: User;
}

@WebSocketGateway({cors: {origin: '*'}})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {



    @WebSocketServer()
    server: Server;

    socketConnected: Set<UserSocket> = new Set();

    private readonly logger: Logger = new Logger(GameGateway.name)

    constructor(private readonly userService: UserService,
                private readonly upgradeService: UpgradeService,
                private readonly redisService: RedisService) {
    }

    onModuleInit() {
        setInterval(async () => {
            this.socketConnected.forEach(async (client) => {
                if (client) {
                    let realTimeData = await this.updateMoney(client.user);

                    await this.emitMoney(client, realTimeData);
                    await this.emitUpgrade(client, realTimeData);
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

    public async emitMoney(client: UserSocket, realTimeData = null) {
        if(realTimeData == null) {
            client.emit('money',
            {
                money : (await this.redisService.getUserData(client.user)).money,
                unit : (await this.redisService.getUserData(client.user)).moneyUnit,
            });
        }else{
            client.emit('money',
            {
                money : (await this.redisService.getUserData(client.user)).money,
                unit : (await this.redisService.getUserData(client.user)).moneyUnit,
                moneyBySec : realTimeData.moneyData.amount,
                moneyBySecUnit : realTimeData.moneyData.unit
            });
        }
       
    }

    public async emitUpgrade(client: UserSocket, realTimeData: { moneyData: { amount: number; unit: Unit; }; upgradesData: any[]; }) {
        client.emit('upgrades', {
            upgrades : (await this.redisService.getUserData(client.user)).upgrades,
            realTimeData : realTimeData.upgradesData
        })
    }

    @SubscribeMessage('click')
    async handleClick(client: UserSocket): Promise<void> {
        let moneyErnedByClick = await this.redisService.incrMoney(client.user.id, 1, Unit.UNIT);
        console.log(moneyErnedByClick);
        client.emit('money',
            {
                money: (await this.redisService.getUserData(client.user)).money,
                unit: (await this.redisService.getUserData(client.user)).moneyUnit,
                moneyErnByClick: moneyErnedByClick.amount,
                moneyErnByClickUnit: moneyErnedByClick.unit
            });
    }


    async handleConnection(client: UserSocket) {
        //CHECK HERE IS USERID ALREADY EXIST ?
        this.logger.log(`${client.userId} connected`);
        this.userService.findById(+client.userId).then(user => {
            client.user = user;
            this.socketConnected.add(client);
            this.redisService.loadUserInRedis(user);
            const maintenant = new Date();
            const differenceEnSecondes = (maintenant.getTime() - user.updatedAt.getTime()) / 1000;
            this.updateMoney(user, differenceEnSecondes);
        });
    }

    handleDisconnect(client: UserSocket) {
        this.logger.log(`${client.userId} disconnect`);
        this.pushRedisToDb(client.user);
        this.socketConnected.delete(client);
    }


    // Mettre à jour l'argent de l'utilisateur
    async updateMoney(user: User, seconds = 1 ): Promise<{ moneyData: { amount: number; unit: Unit; }; upgradesData: any[]; }> {
        // Récupérer les informations de l'utilisateur depuis Redis
        const redisInfos = await this.redisService.getUserData(user);
        // Si l'utilisateur a des mises à niveau
        if (redisInfos.upgrades.length > 0) {
            // Parcourir chaque mise à niveau
            redisInfos.upgrades.forEach(element => {

                // Si l'ID de la mise à niveau est supérieur à 1
                if (element.id > 1) {
                    // Trouver la mise à niveau générée
                    let generatedUpgrade = redisInfos.upgrades.find((upgrade) => upgrade.id == element.generationUpgradeId);
                    // Mettre à jour le montant de la mise à niveau générée
                    generatedUpgrade.amount = element.amount * element.value * seconds;
                    // Mettre à jour l'unité de montant de la mise à niveau générée
                    generatedUpgrade.amountUnit = element.amountUnit;

                } else { // Fan
                    // Mettre à jour l'argent de l'utilisateur
                    redisInfos.money = element.amount * element.value * seconds;
                    // Mettre à jour l'unité d'argent de l'utilisateur
                    redisInfos.moneyUnit = element.amountUnit
                }
                // Réinitialiser le montant de la mise à niveau
                element.amount = 0;
            });
            // Mettre à jour les informations de l'utilisateur dans Redis
            return await this.redisService.updateUserData(user, redisInfos);
        }
        return {moneyData: { amount: 0, unit: Unit.UNIT }, upgradesData: [] };
    }

    // Pousser les informations de Redis vers la base de données
    async pushRedisToDb(user: User) {
        // Récupérer les informations de l'utilisateur depuis Redis
        const redisInfos: IRedisData = await this.redisService.getUserData(user);
        // Créer un nouvel utilisateur avec les informations récupérées
        const newUser = {id: user.id, money: redisInfos.money, money_unite: redisInfos.moneyUnit};
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