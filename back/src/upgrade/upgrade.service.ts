import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upgrade } from './upgrade.entity';
import { UserUpgrade } from 'src/UserUpgrade/userUpgrade.entity';
import { BuyUpgradeDto } from './dto/buy-upgrade.dto';
import { Unit } from "../shared/shared.model";
import { RedisService } from 'src/redis/redis.service';
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


  // Acheter une mise à niveau
  async buyUpgrade(buyUpgradeDto: BuyUpgradeDto, userId: number) {
    // Log de l'appel de la fonction
    this.logger.log("CALL buyUpgrade");
    // Récupération de la mise à niveau de l'utilisateur
    let userUpgrade = await this.redisService.getUpgrade(Number(userId), Number(buyUpgradeDto.upgradeId));
    // Si l'utilisateur n'a pas encore cette mise à niveau
    if (Object.keys(userUpgrade).length === 0) {
      // Récupération de la mise à niveau
      let upgrade = await this.upgradeRepository.findOne({ where: { id: Number(buyUpgradeDto.upgradeId) } });
      // Si l'utilisateur peut créer cette mise à niveau
      if (this.canCreateUpgrade(userId, upgrade)) {
        // Calcul du prix
        let value = upgrade.price * +buyUpgradeDto.quantity;
        let unit = upgrade.price_unit
        // Si l'utilisateur peut payer
        if (await this.redisService.pay(userId, { value, unit })) {
          // Ajout de la mise à niveau à l'utilisateur
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

    // Si l'utilisateur a déjà cette mise à niveau
    } else {
      // Récupération de la mise à niveau
      let upgrade = await this.upgradeRepository.findOne({ where: { id: Number(buyUpgradeDto.upgradeId) } });
      let unit = upgrade.price_unit

      // Si l'utilisateur a acheté plus de 10 de cette mise à niveau
      if (userUpgrade.amountBought >= 10) {
        // Augmentation de l'unité de prix
        unit += Math.floor(userUpgrade.amountBought / 10) * 3;
      }

      // Calcul du prix
      let value = upgrade.price * +buyUpgradeDto.quantity;
      // Si l'utilisateur peut payer
      if (await this.redisService.pay(userId, { value, unit })) {
        // Augmentation de la quantité de la mise à niveau
        this.redisService.incrUpgrade(userId, upgrade.id, +buyUpgradeDto.quantity, Unit.UNIT);
        // Augmentation de la quantité achetée de la mise à niveau
        this.redisService.incrUpgradeAmountBought(userId, upgrade.id, +buyUpgradeDto.quantity)
      }
    }
    // Log de la fin de la fonction
    this.logger.log("OK buyUpgrade");
  }

  async canCreateUpgrade(userId: number, upgrade: Upgrade): Promise<boolean> {
    let pastUpgrade = await this.redisService.getUpgrade(userId, upgrade.id - 1);
    if (Object.keys(pastUpgrade).length !== 0) {
      return true;
    }
    return false;
  }

  async updateById(userId: number, upgradeId: number, amount: number, amountUnit: Unit, amountBought: number) {
    this.logger.log("Upgrade", upgradeId, userId, amount, amountUnit, amountBought);
    if (await this.userUpgradeRepository.exist({ where: { upgradeId, userId } })) {
      return this.userUpgradeRepository.update({ upgradeId: upgradeId, userId: userId }, { amount, amountUnit, amountBought })
    } else {
      return this.userUpgradeRepository.save({ upgradeId: upgradeId, userId: userId, amount, amountUnit, amountBought })
    }
  }
}