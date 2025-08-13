import { UserUpgrade } from "./userUpgrade.entity";
import { User } from "../user/user.entity";
import { Upgrade } from "../upgrade/upgrade.entity";
import { Unit } from "../shared/shared.model";

describe("UserUpgrade entity", () => {
  it("can be instantiated without optional relations", () => {
    const entity = new UserUpgrade();
    entity.amount = 0;
    entity.amountBought = 0;
    entity.amountUnit = Unit.UNIT;
    expect(entity.user).toBeUndefined();
    expect(entity.upgrade).toBeUndefined();
    expect(entity.amount).toBe(0);
    expect(entity.amountBought).toBe(0);
    expect(entity.amountUnit).toBe(Unit.UNIT);
  });

  it("can be instantiated with optional user and upgrade relations", () => {
    const user = new User();
    user.id = 1;
    const upgrade = new Upgrade();
    upgrade.id = 2;

    const entity = new UserUpgrade();
    entity.user = user;
    entity.upgrade = upgrade;
    entity.amount = 5;
    entity.amountBought = 1;
    entity.amountUnit = Unit.K;

    expect(entity.user).toBe(user);
    expect(entity.upgrade).toBe(upgrade);
    expect(entity.amount).toBe(5);
    expect(entity.amountBought).toBe(1);
    expect(entity.amountUnit).toBe(Unit.K);
  });
});
