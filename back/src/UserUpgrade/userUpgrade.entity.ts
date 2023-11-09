import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import {User} from "../user/user.entity";
import {Upgrade} from "../upgrade/upgrade.entity";

@Entity()
export class UserUpgrade extends BaseEntity {
    @PrimaryColumn({ select: false })
    public userId: number

    @PrimaryColumn({ select: false })
    public upgradeId: number

    @Column()
    amount: number;

    @Column()
    amountBought: number;

    @ManyToOne(() => User, (user) => user.userUpgrade)
    public user: User

    @ManyToOne(() => Upgrade, (upgrade) => upgrade.userUpgrade, {eager:true})
    public upgrade: Upgrade
}