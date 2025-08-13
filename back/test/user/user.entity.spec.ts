import { DataSource } from 'typeorm';
import { User } from '../../src/user/user.entity';
import { UserUpgrade } from '../../src/UserUpgrade/userUpgrade.entity';
import { Upgrade } from '../../src/upgrade/upgrade.entity';
import { Unit } from '../../src/shared/shared.model';

describe('User entity with UserUpgrade relation', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [User, UserUpgrade, Upgrade],
      synchronize: true,
    });

    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('persists and retrieves a user with upgrades', async () => {
    const userRepository = dataSource.getRepository(User);
    const upgradeRepository = dataSource.getRepository(Upgrade);
    const userUpgradeRepository = dataSource.getRepository(UserUpgrade);

    const upgrade = upgradeRepository.create({
      name: 'Speed',
      price: 100,
      price_unit: Unit.UNIT,
      ratio: 1,
      generationUpgradeId: 1,
      value: 1,
      imagePath: 'img.png',
    });
    await upgradeRepository.save(upgrade);

    const user = userRepository.create({
      email: 'rel@test.com',
      name: 'RelUser',
      password: 'secret',
      ownedSkins: [],
    });
    await userRepository.save(user);

    const userUpgrade = userUpgradeRepository.create({
      user,
      upgrade,
    });
    await userUpgradeRepository.save(userUpgrade);

    const loadedUser = await userRepository.findOne({
      where: { id: user.id },
      relations: ['userUpgrade'],
    });

    expect(loadedUser).toBeDefined();
    expect(loadedUser!.userUpgrade).toHaveLength(1);
    expect(loadedUser!.userUpgrade[0].upgrade.id).toBe(upgrade.id);
  });
});

