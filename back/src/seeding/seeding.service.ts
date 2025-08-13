import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Upgrade } from "src/upgrade/upgrade.entity";
import { Skin } from "../skin/skin.entity";
import { upgradesData } from "./data/upgrades";
import { skinsData } from "./data/skins";

@Injectable()
export class SeedingService implements OnModuleInit {
  constructor(
    @InjectRepository(Upgrade)
    private readonly upgradeRepository: Repository<Upgrade>,
    @InjectRepository(Skin)
    private readonly skinRepository: Repository<Skin>,
  ) {}

  async onModuleInit() {
    await this.seedUpgrades();
    await this.seedSkins();
  }

  async run() {
    await this.seedUpgrades();
    await this.seedSkins();
  }

  private async seedUpgrades() {
    const count = await this.upgradeRepository.count();

    if (count == 0) {
      await this.upgradeRepository.save(upgradesData);
    }
  }

  private async seedSkins() {
    const count = await this.skinRepository.count();

    if (count == 0) {
      await this.skinRepository.save(skinsData);
    }
  }
}
