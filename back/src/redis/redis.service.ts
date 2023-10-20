import { Inject, Injectable } from '@nestjs/common';
import {RedisClient} from "./redis.provider";
import {Unit} from "../shared/shared.model";
import {User} from "../users/user.entity";

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
            .lpush(`${user.id}:UPGRADES`, ...upgradesId)

        for (const e of user.userUpgrade) {
            chain.set(`${user.id}:${e.upgrade.id}:TIMELEFT`, e.upgrade.timeToGenerate,"EX", 3600)
            chain.set(`${user.id}:${e.upgrade.id}:BASETIME`, e.upgrade.timeToGenerate,"EX", 3600)
            chain.set(`${user.id}:${e.upgrade.id}:GENERATEDUPGRADE`, e.upgrade.generationUpgrade?.id ?? 0,"EX", 3600)
            chain.set(`${user.id}:${e.upgrade.id}:QUANTITY`, e.amount,"EX", 3600)
        }
        await chain.exec()
    }

    public async getUserData(user: User) {
        const chain = this.client.multi()
            .get(`${user.id}:MONEY`)
            .get(`${user.id}:MONEY_UNIT`)
            .lrange(`${user.id}:UPGRADES`, 0, -1)

        for (const e of user.userUpgrade) {
            chain.get(`${user.id}:${e.upgrade.id}:TIMELEFT`)
            chain.get(`${user.id}:${e.upgrade.id}:BASETIME`)
            chain.get(`${user.id}:${e.upgrade.id}:GENERATEDUPGRADE`)
            chain.get(`${user.id}:${e.upgrade.id}:QUANTITY`)
        }
        const data = await chain.exec()
        return data;
    }
}