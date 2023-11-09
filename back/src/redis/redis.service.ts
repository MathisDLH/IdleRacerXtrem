import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from "./redis.provider";
import { IRedisData, IRedisUpgrade, Unit } from "../shared/shared.model";
import { User } from "../user/user.entity";
import { PropertyMetadata } from '@nestjs/core/injector/instance-wrapper';

@Injectable()
export class RedisService {
    public constructor(
        @Inject('REDIS_CLIENT')
        private readonly client: RedisClient,
    ) {
    }


    async getUpgrade(userId: number, upgradeId: number): Promise<IRedisUpgrade> {
        return await this.client.hgetall(`${userId}:${upgradeId}`) as unknown as IRedisUpgrade;
    }

    async addUpgrade(userId: number, upgrade: IRedisUpgrade) {
        await this.client.hset(`${userId}:${upgrade.id}`, upgrade);
    }


    async incrUpgradeAmountBought(userId: number, upgradeId: number, amountToIncr: number) {
        return +await this.client.hincrbyfloat(`${userId}:${upgradeId}`, "amountBought", amountToIncr);
    }

    async incrMoney(userId: number, amountToIncr: number, unit: Unit) {
        let moneyUnit = +await this.getUserMoneyUnit(userId);
        let unitDifference = moneyUnit - unit;
        if (unitDifference != 0) {
             amountToIncr /=  Math.pow(10, unitDifference);
        }
        let money = +await this.client.incrbyfloat(`${userId}:MONEY`, amountToIncr);
        let unityToIncrement = 0;
        while (money > 1001) {
            money /= 1000;
            unityToIncrement += 3;
        }
        if (unityToIncrement > 0) {
            await this.client.incrbyfloat(`${userId}:MONEY_UNIT`, unityToIncrement);
            await this.client.set(`${userId}:MONEY`, money);
        }

        return money;
    }

    async incrUpgrade(userId: number, upgradeId: number, amountToIncr: number, unit: Unit) {
        let upgradeUnit = +await this.client.hget(`${userId}:${upgradeId}`, "amountUnity")
        let unitDifference = upgradeUnit - unit;
        if (unitDifference != 0) {
             amountToIncr /=  Math.pow(10, unitDifference);
        }

        let amount = +await this.client.hincrbyfloat(`${userId}:${upgradeId}`, "amount", amountToIncr)
        let unityToIncrement = 0;
        while (amount > 1001) {
            amount /= 1000;
            unityToIncrement += 3;
        }
        if(unityToIncrement){
            await this.client.hincrbyfloat(`${userId}:${upgradeId}`, "amountUnity", unityToIncrement)
            await this.client.hset(`${userId}:${upgradeId}`, "amount", amount)
        }
       
        return amount;
    }

    async getUserMoney(userId: number) {
        return +await this.client.get(`${userId}:MONEY`);
    }

    async getUserMoneyUnit(userId: number): Promise<string> {
        return await this.client.get(`${userId}:MONEY_UNIT`);
    }

    async pay(userId: number, amount: { value: number, unit: Unit }): Promise<boolean> {
        let userMoney = await this.getUserMoney(userId);
        let userMoneyUnit = +await this.getUserMoneyUnit(userId);

        if (userMoneyUnit >= amount.unit) {
            let differenceUnite = userMoneyUnit - amount.unit;
            let valueToDecrement = amount.value
            if (differenceUnite > 0) {
                valueToDecrement /= Math.pow(10, differenceUnite);
            }

            if (userMoney >= amount.value) {
                userMoney = await this.client.decrby(`${userId}:MONEY`, valueToDecrement);
                let unityToDecrement = 0;
                while (userMoney < 1) {
                    userMoney = userMoney * 1000;
                    unityToDecrement += 3;
                }
                if (unityToDecrement > 0) {
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
            this.addUpgrade(user.id, {
                id: e.upgrade.id,
                amount: e.amount,
                amountUnit: e.amountUnit,
                amountBought: e.amountBought,
                value: e.upgrade.value,
                generationUpgradeId: e.upgrade.generationUpgradeId
            })
        }
        await chain.exec()
    }

    public async getUserData(user: User) {
        console.log("qskjh")
        const upgrades: IRedisUpgrade[] = [];
        let i = 0;
        let end = false;
        while (!end) {
            i++;
            let userUpgrade = await this.client.hgetall(`${user.id}:${i}`);
            if (Object.keys(userUpgrade).length === 0) {
                end = true;
            } else {
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
        this.incrMoney(user.id,data.money,data.moneyUnit)
        for (const e of data.upgrades) {
            this.incrUpgrade(user.id,e.id, e.amount, e.amountUnit)
        }
    }

}