import {Controller, Get, Param, Request, UseGuards} from '@nestjs/common';

import {SkinService} from './skin.service';
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {Skin} from "./skin.entity";

@ApiTags("Skin")
@Controller('skin')
export class SkinController {
    constructor(private readonly skinService: SkinService,
    ) {}


    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiResponse({
        status: 200,
        description: 'Retrieve all skins of the game',
        type: Skin,
        isArray: true
    })
    async findAll(): Promise<Skin[]> {
        return await this.skinService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/purchase')
    @ApiResponse({
        status: 200,
        description: 'purchase a skin'
    })
    async purchase(@Param('id') id: number, @Request() request) {
        this.skinService.purchase(id, request.user.userId);
    }


}