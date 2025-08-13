import { DataSource } from "typeorm";
import { Upgrade } from "../../src/upgrade/upgrade.entity";
import { UserUpgrade } from "../../src/UserUpgrade/userUpgrade.entity";
import { User } from "../../src/user/user.entity";
import { Unit } from "../../src/shared/shared.model";

describe("Upgrade and UserUpgrade integration", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      entities: [User, Upgrade, UserUpgrade],
      synchronize: true,
    });
    await dataSource.initialize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("should load related userUpgrade data when retrieving an upgrade", async () => {
    const user = dataSource.getRepository(User).create({
      email: "test@example.com",
      name: "tester",
      password: "secret",
      ownedSkins: [],
    });
    await dataSource.getRepository(User).save(user);

    const upgrade = dataSource.getRepository(Upgrade).create({
      name: "Speed Boost",
      price: 100,
      price_unit: Unit.UNIT,
      ratio: 1,
      generationUpgradeId: 0,
      value: 2,
      imagePath: "img.png",
    });
    await dataSource.getRepository(Upgrade).save(upgrade);

    const userUpgrade = dataSource.getRepository(UserUpgrade).create({
      user,
      upgrade,
      amount: 3,
      amountBought: 1,
      amountUnit: Unit.UNIT,
    });
    await dataSource.getRepository(UserUpgrade).save(userUpgrade);

    const found = await dataSource.getRepository(Upgrade).findOne({
      where: { id: upgrade.id },
      relations: { userUpgrade: true },
    });

    expect(found).toBeDefined();
    expect(found!.userUpgrade).toHaveLength(1);
    const relation = (found!.userUpgrade as unknown as UserUpgrade[])[0];
    expect(relation.amount).toBe(3);
    expect(relation.amountBought).toBe(1);
  });
});
