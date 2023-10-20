import {Upgrade} from "../upgrade/upgrade.entity";

export enum Unit {
    UNIT = "UNIT",
    MILLION = "MILLION",     // One Million
    BILLION = "BILLION",     // One Billion
    TRILLION = "TRILLION",   // One Trillion
    QUADRILLION = "QUADRILLION", // One Quadrillion
    QUINTILLION = "QUINTILLION", // One Quintillion
    SEXTILLION = "SEXTILLION",  // One Sextillion
    SEPTILLION = "SEPTILLION",  // One Septillion
    OCTILLION = "OCTILLION",   // One Octillion
    NONILLION = "NONILLION",   // One Nonillion
    DECILLION = "DECILLION",   // One Decillion
}


export interface IRedisData {
    money: number;
    moneyUnit: Unit;
    upgrades: IRedisUpgrade[];
}

export interface IRedisUpgrade extends Upgrade {
    timeleft:number;
    amount: number;
}