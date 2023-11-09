import {Inject, Injectable} from '@nestjs/common';
import {RedisClient} from "./redis.provider";
import {IRedisData, IRedisUpgrade, Unit} from "../shared/shared.model";
import {User} from "../user/user.entity";

@Injectable()
export class RedisService {
    public constructor(
        @Inject('REDIS_CLIENT')
        private readonly client: RedisClient,
    ) {
    }


    async getUpgrade(userId: number, upgradeId: number) {
        return await this.client.hgetall(`${userId}:${upgradeId}`);
    }


    async incrMoney(userId: string, amountToIncr: string) {
        await this.client.incrby(`${userId}:MONEY`, amountToIncr);
    }

    public async loadUserInRedis(user: User) {
        // USER MONEY : {USER_ID}:MONEY
        // USER MONEY UNIT : {USER_ID}:MONEY_UNIT
        // USER UPGRADES : {USER_ID}:{UPGRADE_ID}
        const chain
            = this.client.multi()
            .set(`${user.id}:MONEY`, user.money, "EX", 3600)
            .set(`${user.id}:MONEY_UNIT`, user.money_unite, "EX", 3600)
        for (const e of user.userUpgrade) {
            // TODO: Faire une méthode typée pour l'enregistrment redis des upgrades
            chain.hset(`${user.id}:${e.upgrade.id}`, {
                id: e.upgrade.id,
                amount: e.amount,
                amountUnit: e.amountUnit,
                value: e.upgrade.value,
                generationUpgradeId: e.upgrade.generationUpgradeId
            })
        }
        await chain.exec()
    }

    public async getUserData(user: User) {
        const upgrades: IRedisUpgrade[] = [];
        for (const e of user.userUpgrade) {
            upgrades.push(await this.client.hgetall(`${user.id}:${e.upgrade.id}`) as unknown as IRedisUpgrade)
        }
        const data: IRedisData = {
            userId: user.id,
            money: +await this.client.get(`${user.id}:MONEY`),
            moneyUnit: await this.client.get(`${user.id}:MONEY_UNIT`) as Unit,
            upgrades
        }
        return data;
    }

    public async updateUserData(user: User, data: IRedisData) {
        const chain
            = this.client.multi()
            .incrbyfloat(`${user.id}:MONEY`, data.money)
            .set(`${user.id}:MONEY_UNIT`, data.moneyUnit, "EX", 3600)
        for (const e of data.upgrades) {
            chain.hincrbyfloat(`${user.id}:${e.id}`, "amount", e.amount)
            //Mettre à jour l'unité des upgrades
        }
        await chain.exec()
    }

}