import { Upgrade } from "../upgrade/upgrade.entity";

export enum Unit {
  UNIT = 0,
  K = 3,
  MILLION = 6,
  BILLION = 9,
  TRILLION = 12,
  QUADRILLION = 15,
  QUINTILLION = 18,
  SEXTILLION = 21,
  SEPTILLION = 24,
  OCTILLION = 27,
  NONILLION = 30,
  DECILLION = 33,
  UNDECILLION = 36,
  DUODECILLION = 39,
  TREDECILLION = 42,
  QUATTUORDECILLION = 45,
  QUINDECILLION = 48,
  SEXDECILLION = 51,
  SEPTENDECILLION = 54,
  OCTODECILLION = 57,
  NOVEMDECILLION = 60,
  VIGINTILLION = 63,
  UNVIGINTILLION = 66,
  DUOVIGINTILLION = 69,
  TRESVIGINTILLION = 72,
  QUATTUORVIGINTILLION = 75,
  QUINQUAVIGINTILLION = 78,
  SESVIGINTILLION = 81,
  SEPTENVIGINTILLION = 84,
  OCTOVIGINTILLION = 87,
  NOVEMVIGINTILLION = 90,
  TRIGINTILLION = 93,
  UNTRIGINTILLION = 96,
  DUOTRIGINTILLION = 99,
  TRESTRIGINTILLION = 102,
  QUATTUORTRIGINTILLION = 105,
  QUINQUATRIGINTILLION = 108,
  SESTRIGINTILLION = 111,
}

export interface IRedisData {
  userId: number;
  money: number;
  moneyUnit: Unit;
  click: number;
  clickUnit: Unit;
  upgrades: IRedisUpgrade[];
}

export interface IRedisUpgrade {
  id: number;
  generationUpgradeId: number;
  amount: number;
  amountUnit: Unit;
  amountBought: number;
  value: number;
}
