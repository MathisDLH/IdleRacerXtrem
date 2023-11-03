import {Controller, Get, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from 'src/auth/jwt-auth.guard';
import {UpgradeService} from './upgrade.service';
import {ApiBearerAuth, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Upgrade} from "./upgrade.entity";
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpgradeService } from './upgrade.service';
import { Request } from '@nestjs/common';
import { BuyUpgradeDto } from './dto/buy-upgrade.dto';

@ApiBearerAuth()
@ApiTags("Upgrade")
@Controller('upgrade')
export class UpgradeController {
    constructor(private readonly upgradeService: UpgradeService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiResponse({
        status: 200,
        description: 'Retrieve all upgrades of the game',
        type: Upgrade,
        isArray: true
    })
    async findAll(): Promise<Upgrade[]> {
        return await this.upgradeService.findAll();
    }

  @UseGuards(JwtAuthGuard)
  @Post("/buyUpgrade")
  async buyUpgrade(@Body() buyUpgradeDto : BuyUpgradeDto, @Request() req) {
    return this.upgradeService.buyUpgrade(buyUpgradeDto, req.user.userId);
  }

}