import { DataSource } from "typeorm";
import { UserUpgrade } from "./userUpgrade.entity";
import { User } from "../user/user.entity";
import { Upgrade } from "../upgrade/upgrade.entity";
import { Unit } from "../shared/shared.model";

describe("UserUpgrade repository", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      entities: [User, Upgrade, UserUpgrade],
      synchronize: true,
      dropSchema: true,
      relationLoadStrategy: "query",
    });
    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
  });

  it("persists relations and hydrates them on fetch", async () => {
    const userRepository = dataSource.getRepository(User);
    const upgradeRepository = dataSource.getRepository(Upgrade);
    const userUpgradeRepository = dataSource.getRepository(UserUpgrade);

    const user = await userRepository.save(
      userRepository.create({
        email: "test@example.com",
        name: "tester",
        password: "password",
        money: 0,
        currentSkin: "LAMBORGHINI",
        ownedSkins: [],
        money_unite: Unit.UNIT,
        click: 0,
        click_unite: Unit.UNIT,
      }),
    );

    const upgrade = await upgradeRepository.save(
      upgradeRepository.create({
        name: "Turbo",
        price: 100,
        price_unit: Unit.UNIT,
        ratio: 1.5,
        generationUpgradeId: 0,
        value: 2,
        imagePath: "path",
      }),
    );

    await userUpgradeRepository.save(
      userUpgradeRepository.create({
        user,
        upgrade,
        amount: 5,
        amountBought: 1,
        amountUnit: Unit.UNIT,
      }),
    );

    const found = await userUpgradeRepository
      .createQueryBuilder("uu")
      .addSelect(["uu.userId", "uu.upgradeId"])
      .leftJoinAndSelect("uu.user", "user")
      .leftJoinAndSelect("uu.upgrade", "upgrade")
      .where("uu.userId = :uid AND uu.upgradeId = :gid", {
        uid: user.id,
        gid: upgrade.id,
      })
      .getOne();

    expect(found).toBeDefined();
    expect(found!.user.id).toBe(user.id);
    expect(found!.upgrade.id).toBe(upgrade.id);
  });
});
