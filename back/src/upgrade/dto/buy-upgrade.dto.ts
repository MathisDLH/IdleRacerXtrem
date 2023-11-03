import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuyUpgradeDto {
  @ApiProperty()
  @IsNotEmpty()
  upgradeId: string;

  @ApiProperty()
  @IsNotEmpty()
  quantity: string;
  
}