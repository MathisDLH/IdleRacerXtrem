import {Body, Controller, Get, Post, Request, UseFilters, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from 'src/auth/jwt-auth.guard';
import {UpgradeService} from './upgrade.service';
import {ApiBearerAuth, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Upgrade} from "./upgrade.entity";
import {BuyUpgradeDto} from './dto/buy-upgrade.dto';
import {EffectiveExceptionFilter} from "../filters/EffectiveException.filter";

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
  @UseFilters(new EffectiveExceptionFilter())
  @Post("/buyUpgrade")
  async buyUpgrade(@Body() buyUpgradeDto : BuyUpgradeDto, @Request() req) {
    return this.upgradeService.buyUpgrade(buyUpgradeDto, req.user.userId);
  }

}