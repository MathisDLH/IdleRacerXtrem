import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Upgrade} from './upgrade.entity';
import { UserUpgrade } from 'src/UserUpgrade/userUpgrade.entity';
import { BuyUpgradeDto } from './dto/buy-upgrade.dto';

@Injectable()
export class UpgradeService {
    constructor(
        @InjectRepository(UserUpgrade)
    private userUpgradeRepository : Repository<UserUpgrade>,
    @InjectRepository(Upgrade)
        private upgradeRepository: Repository<Upgrade>,
    ) {
    }

    async create(userId: string, buyUpgradeDto: BuyUpgradeDto) {
    let userUpgrade = this.userUpgradeRepository.create({
      userId: Number(userId),
      upgradeId: Number(buyUpgradeDto.upgradeId),
      amount: Number(buyUpgradeDto.quantity)
    });
    userUpgrade = await userUpgrade.save();
    return userUpgrade;
}findAll(): Promise<Upgrade[]> {
        return this.upgradeRepository.find();
    }async buyUpgrade(buyUpgradeDto : BuyUpgradeDto, userId: string): Promise<UserUpgrade>{
    let upgrade = await this.userUpgradeRepository.findOne({ where: { userId: Number(userId), upgradeId: Number(buyUpgradeDto.upgradeId) } });

    if (!upgrade) {
      return this.create(userId, buyUpgradeDto);
    } else {
      upgrade.amount += Number(buyUpgradeDto.quantity);
      return this.userUpgradeRepository.save(upgrade);
    }
  }
}