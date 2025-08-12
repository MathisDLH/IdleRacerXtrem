import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from "./redis.provider";
import { IRedisData, IRedisUpgrade, Unit } from "../shared/shared.model";
import { User } from "../user/user.entity";
import {PurchaseError} from "../exceptions/PurchaseError";


@Injectable()
export class RedisService {
    public constructor(
        @Inject('REDIS_CLIENT')
        private readonly client: RedisClient,
    ) {}


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
        let amountIncremented = amountToIncr;
        if (unitDifference != 0) {
             amountIncremented /=  Math.pow(10, unitDifference);
        }
        let money = +await this.client.incrbyfloat(`${userId}:MONEY`, amountIncremented);
        let unityToIncrement = 0;
        while (money > 1001) {
            money /= 1000;
            unityToIncrement += 3;
        }
        if (unityToIncrement > 0) {
            await this.client.incrbyfloat(`${userId}:MONEY_UNIT`, unityToIncrement);
            await this.client.set(`${userId}:MONEY`, money);
        }

        return { amount: amountToIncr, unit};
    }

    async incrClick(userId: number, amountToIncr: number, unit: Unit): Promise<{ amount: number; unit: number; }> {
        let clickUnit = +await this.getUserClickUnit(userId);
        let unitDifference = clickUnit - unit;
        let amountIncremented = amountToIncr;
        if (unitDifference != 0) {
             amountIncremented /=  Math.pow(10, unitDifference);
        }
        let click = +await this.client.incrbyfloat(`${userId}:CLICK`, amountIncremented);
        let unityToIncrement = 0;
        while (click > 1001) {
            click /= 1000;
            unityToIncrement += 3;
        }
        if (unityToIncrement > 0) {
            clickUnit = +await this.client.incrbyfloat(`${userId}:CLICK_UNIT`, unityToIncrement);
            await this.client.set(`${userId}:CLICK`, click);
        }
        console.log(click, clickUnit)
        return { amount: click, unit: clickUnit};
    }

    async incrUpgrade(userId: number, upgradeId: number, amountToIncr: number, unit: Unit) {
        let upgradeUnit = +await this.client.hget(`${userId}:${upgradeId}`, "amountUnit")
        let unitDifference = upgradeUnit - unit;
        let amountIncremented = amountToIncr;
        if (unitDifference != 0) {
             amountIncremented /=  Math.pow(10, unitDifference);
        }

        let amount = +await this.client.hincrbyfloat(`${userId}:${upgradeId}`, "amount", amountIncremented)
        let unityToIncrement = 0;
        while (amount > 1001) {
            amount /= 1000;
            unityToIncrement += 3;
        }
        if(unityToIncrement){
            upgradeUnit = +await this.client.hincrbyfloat(`${userId}:${upgradeId}`, "amountUnit", unityToIncrement)
            await this.client.hset(`${userId}:${upgradeId}`, "amount", amount)
        }
       
        return { amountGenerated: amountToIncr, generatedUnit : unit};
    }

    async getUserMoney(userId: number) {
        return +await this.client.get(`${userId}:MONEY`);
    }

    async getUserMoneyUnit(userId: number): Promise<string> {
        return await this.client.get(`${userId}:MONEY_UNIT`);
    }

    async getUserClick(userId: number) {
        return +await this.client.get(`${userId}:CLICK`);
    }

    async getUserClickUnit(userId: number): Promise<string> {
        return await this.client.get(`${userId}:CLICK_UNIT`);
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
            if (userMoney >= valueToDecrement) {
                userMoney = +await this.client.incrbyfloat(`${userId}:MONEY`, -valueToDecrement);
                let unityToDecrement = 0;
                while (userMoney < 1 && (userMoneyUnit - unityToDecrement > 0)) {
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
        throw new PurchaseError(userMoney.toString(), amount.value.toString());
    }

    public async loadUserInRedis(user: User) {
        // USER MONEY : {USER_ID}:MONEY
        // USER MONEY UNIT : {USER_ID}:MONEY_UNIT
        // USER UPGRADES : {USER_ID}:{UPGRADE_ID}
        const chain
            = this.client.multi()
                .set(`${user.id}:MONEY`, user.money, "EX", 3600)
                .set(`${user.id}:MONEY_UNIT`, user.money_unite, "EX", 3600)
                .set(`${user.id}:CLICK`, user.click, "EX", 3600)
                .set(`${user.id}:CLICK_UNIT`, user.click_unite, "EX", 3600)
        for (const e of user.userUpgrade) {
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
        const data: IRedisData = {
            userId: user.id,
            money: +await this.client.get(`${user.id}:MONEY`),
            moneyUnit: +await this.getUserMoneyUnit(user.id),
            click: +await this.client.get(`${user.id}:CLICK`),
            clickUnit:  +await this.getUserClickUnit(user.id),
            upgrades
        }
        return data;
    }

    public async updateUserData(user: User, data: IRedisData) {
        let moneyData = await this.incrMoney(user.id,data.money,data.moneyUnit)
        const upgradesData = [];
        for (const e of data.upgrades) {
            let realTimeData = await this.incrUpgrade(user.id,e.id, e.amount, e.amountUnit);

            upgradesData.push({
                upgrade : await this.getUpgrade(user.id, e.id),
                amountGenerated : realTimeData.amountGenerated,
                generatedUnit : realTimeData.generatedUnit,
            })
        }
        return {moneyData, upgradesData};
    }

}