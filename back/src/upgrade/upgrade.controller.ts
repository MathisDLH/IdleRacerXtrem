import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpgradeService } from './upgrade.service';
import { Request } from '@nestjs/common';
import { BuyUpgradeDto } from './dto/buy-upgrade.dto';

@Controller('upgrades')
export class UpgradeController {
  constructor(private readonly upgradeService: UpgradeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUpgrades() {
    const upgrades = await this.upgradeService.findAll();
    return JSON.stringify(upgrades);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/buyUpgrade")
  async buyUpgrade(@Body() buyUpgradeDto : BuyUpgradeDto, @Request() req) {
    return this.upgradeService.buyUpgrade(buyUpgradeDto, req.user.userId);
  }

}