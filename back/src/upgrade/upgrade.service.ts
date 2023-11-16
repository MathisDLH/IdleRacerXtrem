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
      if (await this.canCreateUpgrade(userId, upgrade)) {
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
      let price = upgrade.price;

      const multiplier = userUpgrade.amountBought >= 10 ? Math.floor(userUpgrade.amountBought / 10) * 2 : 0;
      price *= Math.pow(10, multiplier);

      while (price > 1001) {
        price /= 1000;
        unit += 3;
      }

      // Calcul du prix
      let value = price * +buyUpgradeDto.quantity;
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

  async buyClick(amountPay: number, amountPayUnit: Unit, userId: number): Promise<{ amount: number; unit: Unit; }> {
    if(await this.redisService.pay(userId, { value: amountPay, unit: amountPayUnit })){
      let amountOfClick = amountPay / 100;
      let unitOfClick = amountPayUnit;
      if (amountOfClick < 1) {
        amountOfClick *= 1000;
        unitOfClick -= 3;
      }
      return await this.redisService.incrClick(userId, amountOfClick, unitOfClick);
    }
   return { amount: 0, unit: 0 }
  }

  // Cette fonction vérifie si l'utilisateur peut créer une mise à niveau
  async canCreateUpgrade(userId: number, upgrade: Upgrade): Promise<boolean> {
    if(upgrade.id === 1) {
      return true;
    }
    // Récupération de la mise à niveau précédente
    let pastUpgrade = await this.redisService.getUpgrade(userId, upgrade.id - 1);
    // Si l'utilisateur a déjà la mise à niveau précédente
    if (Object.keys(pastUpgrade).length !== 0) {
      return true;
    }
    // Si l'utilisateur n'a pas la mise à niveau précédente
    return false;
  }

  // Cette fonction met à jour la mise à niveau par son ID
  async updateById(userId: number, upgradeId: number, amount: number, amountUnit: Unit, amountBought: number) {
    // Si la mise à niveau existe déjà pour l'utilisateur
    if (await this.userUpgradeRepository.exist({ where: { upgradeId, userId } })) {
      // Mise à jour de la mise à niveau
      return this.userUpgradeRepository.update({ upgradeId: upgradeId, userId: userId }, { amount, amountUnit, amountBought })
    } else {
      // Sinon, sauvegarde de la nouvelle mise à niveau
      return this.userUpgradeRepository.save({ upgradeId: upgradeId, userId: userId, amount, amountUnit, amountBought })
    }
  }
}