import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpgradeService } from './upgrade.service';

@Controller('upgrades')
export class UpgradeController {
  constructor(private readonly upgradeService: UpgradeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUpgrades() {
    const upgrades = await this.upgradeService.findAll();
    return JSON.stringify(upgrades);
  }

}