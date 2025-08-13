import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { Unit } from "../shared/shared.model";
import { IsEmail, IsEnum, IsString, MinLength, IsArray } from "class-validator";
import { UserUpgrade } from "../UserUpgrade/userUpgrade.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class User extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @ApiProperty()
  @Column({ unique: true })
  @IsString()
  @MinLength(3)
  name: string;

  @Column({ select: false })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @Column({ type: "float", default: 0 })
  money: number;

  @ApiProperty()
  @Column({ default: "LAMBORGHINI" })
  @IsString()
  currentSkin: string;

  @ApiProperty()
  @Column({ type: "simple-array" })
  @IsArray()
  ownedSkins: string[];

  @ApiProperty()
  @Column({ type: "simple-enum", enum: Unit, default: Unit.UNIT })
  @IsEnum(Unit)
  money_unite: Unit;

  @ApiProperty()
  @Column({ type: "float", default: 1 })
  click: number;

  @ApiProperty()
  @Column({ type: "simple-enum", enum: Unit, default: Unit.UNIT })
  @IsEnum(Unit)
  click_unite: Unit;

  @Column()
  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @OneToMany(() => UserUpgrade, (userUpgrade) => userUpgrade.user)
  @ApiProperty()
  public userUpgrade: UserUpgrade[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 8);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
