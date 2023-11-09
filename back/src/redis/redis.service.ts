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

    async addUpgrade(userId: number, upgrade: IRedisUpgrade) {
        await this.client.hset(`${userId}:${upgrade.id}`, upgrade);
    }


    async incrMoney(userId: number, amountToIncr: number) {
       let money = await this.client.incrby(`${userId}:MONEY`, amountToIncr);
       let unityToIncrement = 0;
       while (money > 1001) {
         money /= 1000;
         unityToIncrement += 3;
       }
       await this.client.incrby(`${userId}:MONEY_UNIT`, unityToIncrement);
       await this.client.set(`${userId}:MONEY`, money);
       return money;
    }

    async getUserMoney(userId: number) {
        return +await this.client.get(`${userId}:MONEY`);
    }

    async getUserMoneyUnit(userId: number): Promise<string> {
        return await this.client.get(`${userId}:MONEY_UNIT`);
    }

    async pay(userId: number, amount: { value: number, unit: Unit }) : Promise<boolean> {
        let userMoney = await this.getUserMoney(+userId);
        let userMoneyUnit = +await this.getUserMoneyUnit(+userId);
        console.log(1)
        console.log(userMoneyUnit)
        console.log(amount.unit)

        if (userMoneyUnit >= amount.unit) {
            console.log(11)
            let differenceUnite = userMoneyUnit - amount.unit;
            let valueToDecrement = amount.value
            if (differenceUnite > 0) {
                console.log(111)
                valueToDecrement /= Math.pow(10, differenceUnite);
            }
            console.log(1111)
            console.log(userMoney)
            console.log(amount.value)
            if (userMoney >= amount.value) {
                console.log(5)
                userMoney = await this.client.decrby(`${userId}:MONEY`, valueToDecrement);
                let unityToDecrement = 0;
                while (userMoney < 1) {
                    userMoney = userMoney * 1000;
                    unityToDecrement += 3;
                }
                if (unityToDecrement > 0 ){
                    userMoneyUnit = await this.client.decrby(`${userId}:MONEY_UNIT`, unityToDecrement);
                    await this.client.set(`${userId}:MONEY`, userMoney);
                }
                return true;
            }
        }
        return false;
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
            this.addUpgrade(user.id,{
                id: e.upgrade.id,
                amount: e.amount,
                amountUnit: e.amountUnit,
                amountBought : e.amountBought, 
                value: e.upgrade.value,
                generationUpgradeId: e.upgrade.generationUpgradeId
            })
        }
        await chain.exec()
    }

    public async getUserData(user: User) {
        const upgrades: IRedisUpgrade[] = [];
        let i = 0; 
        let end = false;
        while(!end) {
            i++;
            let userUpgrade =  await this.client.hgetall(`${user.id}:${i}`);
            if (Object.keys(userUpgrade).length === 0) {
                end = true; 
            }else{
                upgrades.push(userUpgrade as unknown as IRedisUpgrade);
            }
        }

        for (const e of user.userUpgrade) {
            console.log(e);
            
        }
        const data: IRedisData = {
            userId: user.id,
            money: +await this.client.get(`${user.id}:MONEY`),
            moneyUnit: +await this.getUserMoneyUnit(user.id),
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