import { Inject, Injectable } from '@nestjs/common';
import {RedisClient} from "./redis.provider";

@Injectable()
export class RedisService {
    public constructor(
        @Inject('REDIS_CLIENT')
        private readonly client: RedisClient,
    ) {}


    async getMoney(userId:string) {
        await this.client.get(`${userId}:MONEY`);
    }

    async setMoney(userId: string, money: number){
        await this.client.set(`${userId}:MONEY`, money);
    }

    async incrMoney(userId: string, amountToIncr: string){
        await this.client.incrby(`${userId}:MONEY`, amountToIncr);
    }

    async decrMoney(userId: string, amountToDecr: string){
        await this.client.decrby(`${userId}:MONEY`, amountToDecr);
    }
}