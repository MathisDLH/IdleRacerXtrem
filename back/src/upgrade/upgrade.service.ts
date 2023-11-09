import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Upgrade} from './upgrade.entity';
import {UserUpgrade} from 'src/UserUpgrade/userUpgrade.entity';
import {BuyUpgradeDto} from './dto/buy-upgrade.dto';
import {Unit} from "../shared/shared.model";
import {RedisService} from 'src/redis/redis.service';
import { log } from 'console';

@Injectable()
export class UpgradeService {
    constructor(
        @InjectRepository(UserUpgrade)
        private userUpgradeRepository: Repository<UserUpgrade>,
        @InjectRepository(Upgrade)
        private upgradeRepository: Repository<Upgrade>,
        private readonly redisService: RedisService,
    ) {
    }

    private readonly logger: Logger = new Logger(UpgradeService.name);

    async create(userId: string, buyUpgradeDto: BuyUpgradeDto) {
        let userUpgrade = this.userUpgradeRepository.create({
            userId: Number(userId),
            upgradeId: Number(buyUpgradeDto.upgradeId),
            amount: Number(buyUpgradeDto.quantity)
        });
        userUpgrade = await userUpgrade.save();
        return userUpgrade;
    }

    findAll(): Promise<Upgrade[]> {
        return this.upgradeRepository.find();
    }


  async buyUpgrade(buyUpgradeDto: BuyUpgradeDto, userId: number){
    this.logger.log("CALL buyUpgrade");
    let userUpgrade = await this.redisService.getUpgrade(Number(userId), Number(buyUpgradeDto.upgradeId));
    if (Object.keys(userUpgrade).length === 0) {
      let upgrade = await this.upgradeRepository.findOne({ where: { id: Number(buyUpgradeDto.upgradeId) } });
      if(this.canCreateUpgrade(userId, upgrade)){
        let value = upgrade.price * +buyUpgradeDto.quantity;
        let unit = upgrade.price_unit
        if(await this.redisService.pay(userId,{value, unit})){
          await this.redisService.addUpgrade(userId, {
            id: upgrade.id,
            amount: +buyUpgradeDto.quantity,
            amountUnit: Unit.UNIT,
            amountBought: +buyUpgradeDto.quantity,
            value: upgrade.value,
            generationUpgradeId: upgrade.generationUpgradeId
          })
        }
      }

    } else {
      let upgrade = await this.upgradeRepository.findOne({ where: { id: Number(buyUpgradeDto.upgradeId) } });

      let unit = upgrade.price_unit

      if(userUpgrade.amountBought > 10 ){
         unit = upgrade.price_unit + ( Math.floor(userUpgrade.amountBought / 10) * 3 );
      }

      let value = upgrade.price * +buyUpgradeDto.quantity;
        if(await this.redisService.pay(userId,{value, unit})){
          
        }
    }
    this.logger.log("OK buyUpgrade");
  }

  async canCreateUpgrade(userId : number , upgrade : Upgrade): Promise<boolean>{
    let pastUpgrade = await this.redisService.getUpgrade(userId, upgrade.id - 1);
    if (Object.keys(pastUpgrade).length !== 0) {
        
        return true;
    }
    return false;
  }

    async updateById(userId: number, upgradeId: number, amount: number, amountUnit: Unit, amountBought: number) {
      if(this.userUpgradeRepository.exist({where: {upgradeId, userId}})) {
        return this.userUpgradeRepository.update({upgradeId: upgradeId, userId: userId }, {amount, amountUnit,amountBought})
      } else {
        return this.userUpgradeRepository.save({upgradeId: upgradeId, userId: userId ,amount, amountUnit,amountBought})
      }
    }
}