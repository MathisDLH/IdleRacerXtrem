import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import {User} from "../user/user.entity";
import {Upgrade} from "../upgrade/upgrade.entity";
import {ApiProperty} from "@nestjs/swagger";
import {Unit} from "../shared/shared.model";

@Entity()
export class UserUpgrade extends BaseEntity {
    @PrimaryColumn({ select: false })
    public userId: number

    @PrimaryColumn({ select: false })
    public upgradeId: number

    @Column({type: 'float', default: 0})
    amount: number;

    @Column({type: 'float', default: 0})
    amountBought: number;

    @ApiProperty()
    @Column({type: "enum", enum: Unit, default: Unit.UNIT})
    amountUnit: Unit;

    @ManyToOne(() => User, (user) => user.userUpgrade)
    public user: User

    @ManyToOne(() => Upgrade, (upgrade) => upgrade.userUpgrade, {eager:true})
    public upgrade: Upgrade
}