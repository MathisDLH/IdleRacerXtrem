import { DataSource } from 'typeorm';
import { UserUpgrade } from './userUpgrade.entity';
import { User } from '../user/user.entity';
import { Upgrade } from '../upgrade/upgrade.entity';
import { Unit } from '../shared/shared.model';

describe('UserUpgrade repository', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [User, Upgrade, UserUpgrade],
      synchronize: true,
    });
    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('persists relations and hydrates them on fetch', async () => {
    const userRepository = dataSource.getRepository(User);
    const upgradeRepository = dataSource.getRepository(Upgrade);
    const userUpgradeRepository = dataSource.getRepository(UserUpgrade);

    const user = userRepository.create({
      email: 'test@example.com',
      name: 'tester',
      password: 'password',
      money: 0,
      currentSkin: 'LAMBORGHINI',
      ownedSkins: [],
      money_unite: Unit.UNIT,
      click: 0,
      click_unite: Unit.UNIT,
    });
    await userRepository.save(user);

    const upgrade = upgradeRepository.create({
      name: 'Turbo',
      price: 100,
      price_unit: Unit.UNIT,
      ratio: 1.5,
      generationUpgradeId: 0,
      value: 2,
      imagePath: 'path',
    });
    await upgradeRepository.save(upgrade);

    const userUpgrade = userUpgradeRepository.create({
      user,
      upgrade,
      amount: 5,
      amountBought: 1,
      amountUnit: Unit.UNIT,
    });
    await userUpgradeRepository.save(userUpgrade);

    const found = await userUpgradeRepository.findOne({
      where: { userId: user.id, upgradeId: upgrade.id },
      relations: ['user', 'upgrade'],
    });

    expect(found).toBeDefined();
    // Access the properties to ensure decorators resolved the relations
    expect(found!.user).toBeDefined();
    expect(found!.upgrade).toBeDefined();
    expect(found!.user.id).toBe(user.id);
    expect(found!.upgrade.id).toBe(upgrade.id);
  });
});

