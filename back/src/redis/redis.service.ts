import { Inject, Injectable } from '@nestjs/common';
import {RedisClient} from "./redis.provider";
import {IRedisData, IRedisUpgrade, Unit} from "../shared/shared.model";
import {User} from "../user/user.entity";

@Injectable()
export class RedisService {
    public constructor(
        @Inject('REDIS_CLIENT')
        private readonly client: RedisClient,
    ) {}

    async getMoney(userId:string) {
        await this.client.get(`${userId}:MONEY`);
    }

    async setMoney(userId: number, money: number){
        await this.client.set(`${userId}:MONEY`, money);
    }

    async setMoneyUnite(userId: number, unit:Unit) {
        await this.client.set(`${userId}:MONEY_UNIT`, unit);
    }

    async incrMoney(userId: string, amountToIncr: string){
        await this.client.incrby(`${userId}:MONEY`, amountToIncr);
    }

    async decrMoney(userId: string, amountToDecr: string){
        await this.client.decrby(`${userId}:MONEY`, amountToDecr);
    }

    async setUpgrades(userId: number, upgradeIds: number[]){
        await this.client.lpush(`${userId}:UPGRADES`,...upgradeIds);
    }

    async getUpgrade(userId: number, upgradeId: number){
        return await this.client.hgetall(`${userId}:${upgradeId}`);
    }
     async setTimeleft(userId: number, upgradeId:number, timeLeft: number) {
         await this.client.set(`${userId}:${upgradeId}:TIMELEFT`, timeLeft);
     }

    async setBasetime(userId: number, upgradeId:number, baseTime: number) {
        await this.client.set(`${userId}:${upgradeId}:BASETIME`, baseTime);
    }

    async setGeneratedUpgrade(userId: number, upgradeId:number, generatedUpgrade: number) {
        await this.client.set(`${userId}:${upgradeId}:GENERATEDUPGRADE`, generatedUpgrade);
    }

    async setQuantity(userId: number, upgradeId:number, quantity: number) {
        await this.client.set(`${userId}:${upgradeId}:QUANTITY`, quantity);
    }


    public async loadUserInRedis(user: User) {
        const upgradesId = user.userUpgrade.map((up) => up.upgrade.id);
        const chain
            = this.client.multi()
            .set(`${user.id}:MONEY`, user.money, "EX", 3600)
            .set(`${user.id}:MONEY_UNIT`, user.money_unite, "EX", 3600)
        for (const e of user.userUpgrade) {
            chain.hset(`${user.id}:${e.upgrade.id}`, e)
        }
        await chain.exec()
    }

    public async getUserData(user: User) {
        const upgrades: IRedisUpgrade[] = [];
        for (const e of user.userUpgrade) {
            upgrades.push(await this.client.hgetall(`${user.id}:${e.upgrade.id}`) as unknown as IRedisUpgrade)
        }
        const data: IRedisData = {
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
            chain.hincrby(`${user.id}:${e.id}`,"amount" , e.amount)
            console.log(e.amount);
        }
        await chain.exec()
    }

}