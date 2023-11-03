import {
    BaseEntity,
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {Unit} from "../shared/shared.model";
import {UserUpgrade} from "../UserUpgrade/userUpgrade.entity";
import {ApiProperty} from "@nestjs/swagger";


@Entity()
export class User extends BaseEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({unique: true})
    email: string;

    @ApiProperty()
    @Column({unique: true})
    name: string;

    @Column({select: false})
    password: string;

    @ApiProperty()
    @Column({default: 0})
    money: number;

    @ApiProperty()
    @Column({default: 1})
    skin_id: number;

    @ApiProperty()
    @Column({type: "enum", enum: Unit, default: Unit.UNIT})
    money_unite: Unit;

    @Column()
    @CreateDateColumn()
    @ApiProperty()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    @ApiProperty()
    updatedAt: Date;

    @OneToMany(() => UserUpgrade, userUpgrade => userUpgrade.user)
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