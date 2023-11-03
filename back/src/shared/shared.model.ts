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
    UNDECILLION = "UNDECILLION",   // One Undecillion
    DUODECILLION = "DUODECILLION", // One Duodecillion
    TREDECILLION = "TREDECILLION", // One Tredecillion
    QUATTUORDECILLION = "QUATTUORDECILLION", // One Quattuordecillion
    QUINDECILLION = "QUINDECILLION", // One Quindecillion
    SEXDECILLION = "SEXDECILLION",   // One Sexdecillion
    SEPTENDECILLION = "SEPTENDECILLION", // One Septendecillion
    OCTODECILLION = "OCTODECILLION", // One Octodecillion
    NOVEMDECILLION = "NOVEMDECILLION", // One Novemdecillion
    VIGINTILLION = "VIGINTILLION",
    UNVIGINTILLION = "UNVIGINTILLION", // One Unvigintillion (10^66)
    DUOVIGINTILLION = "DUOVIGINTILLION", // One Duovigintillion (10^69)
    TRESVIGINTILLION = "TRESVIGINTILLION", // One Tresvigintillion (10^72)
    QUATTUORVIGINTILLION = "QUATTUORVIGINTILLION", // One Quattuorvigintillion (10^75)
    QUINQUAVIGINTILLION = "QUINQUAVIGINTILLION", // One Quinquavigintillion (10^78)
    SESVIGINTILLION = "SESVIGINTILLION", // One Sesvigintillion (10^81)
    SEPTENVIGINTILLION = "SEPTENVIGINTILLION", // One Septenvigintillion (10^84)
    OCTOVIGINTILLION = "OCTOVIGINTILLION", // One Octovigintillion (10^87)
    NOVEMVIGINTILLION = "NOVEMVIGINTILLION", // One Novemvigintillion (10^90)
    TRIGINTILLION = "TRIGINTILLION", // One Trigintillion (10^93)
    UNTRIGINTILLION = "UNTRIGINTILLION", // One Untrigintillion (10^96)
    DUOTRIGINTILLION = "DUOTRIGINTILLION", // One Duotrigintillion (10^99)
    TRESTRIGINTILLION = "TRESTRIGINTILLION", // One Trestrigintillion (10^102)
    QUATTUORTRIGINTILLION = "QUATTUORTRIGINTILLION", // One Quattuortrigintillion (10^105)
    QUINQUATRIGINTILLION = "QUINQUATRIGINTILLION", // One Quinquatrigintillion (10^108)
    SESTRIGINTILLION = "SESTRIGINTILLION",  
}


export interface IRedisData {
    money: number;
    moneyUnit: Unit;
    upgrades: IRedisUpgrade[];
}

export interface IRedisUpgrade extends Upgrade {
    amount: number;
}