import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../user/user.entity";
import { Unit } from "../shared/shared.model";
import { UserUpgrade } from "../UserUpgrade/userUpgrade.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Upgrade extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  price: number;

  @ApiProperty()
  @Column({ type: "simple-enum", enum: Unit, default: Unit.UNIT })
  price_unit: Unit;

  @ApiProperty()
  @Column()
  ratio: number;

  @ApiProperty()
  @Column()
  generationUpgradeId: number;

  @ApiProperty()
  @Column("float", { comment: "Nombre de type généré" })
  value: number;

  @ApiProperty()
  @Column()
  imagePath: string;

  @ApiProperty()
  @OneToMany(() => UserUpgrade, (userUpgrade) => userUpgrade.upgrade)
  public userUpgrade: User[];
}
