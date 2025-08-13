import { User } from "./user.entity";
import { UserUpgrade } from "../UserUpgrade/userUpgrade.entity";
import * as bcrypt from "bcryptjs";

describe("User entity", () => {
  it("creates user without relations", () => {
    const user = new User();
    user.email = "no@example.com";
    user.name = "NoRel";
    user.password = "plain";
    user.ownedSkins = [];

    expect(user.userUpgrade).toBeUndefined();
    expect(user.ownedSkins).toEqual([]);
  });

  it("creates user with skins and upgrades then resets them", () => {
    const user = new User();
    user.email = "rel@example.com";
    user.name = "Rel";
    user.password = "plain";

    const upgrade = new UserUpgrade();
    upgrade.user = user;
    user.userUpgrade = [upgrade];
    user.ownedSkins = ["FIRST"];

    expect(user.userUpgrade).toHaveLength(1);
    expect(user.userUpgrade[0]).toBe(upgrade);
    expect(user.ownedSkins).toEqual(["FIRST"]);

    // reset relations
    user.userUpgrade = [];
    user.ownedSkins = [];

    expect(user.userUpgrade).toEqual([]);
    expect(user.ownedSkins).toEqual([]);
  });

  it("hashes and validates password", async () => {
    const user = new User();
    user.password = "secret";

    await user.hashPassword();

    expect(user.password).not.toBe("secret");
    expect(await bcrypt.compare("secret", user.password)).toBe(true);
    expect(await user.validatePassword("secret")).toBe(true);
    expect(await user.validatePassword("wrong")).toBe(false);
  });
});
