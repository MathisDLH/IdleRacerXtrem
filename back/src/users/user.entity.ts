import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity, JoinTable, ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Unit } from "../shared/shared.model";
import { Upgrade } from "../upgrade/upgrade.entity";
import {UserUpgrade} from "../UserUpgrade/userUpgrade.entity";

@Entity()
  export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    email: string;
  
    @Column({ select: false })
    password: string;

    @Column({default: 0})
    money: number;

    @Column({type: "enum", enum: Unit, default: Unit.UNIT})
    money_unite: Unit;

    @Column({default: 0})
    fans: number;

    @Column({type: "enum", enum: Unit, default: Unit.UNIT})
    fans_unite: Unit;

    @Column()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

  @OneToMany(() => UserUpgrade, userUpgrade => userUpgrade.user)
  public userUpgrade: UserUpgrade[];


  
    @BeforeInsert()
    async hashPassword() {
      this.password = await bcrypt.hash(this.password, 8);
    }
  
    async validatePassword(password: string): Promise<boolean> {
      return bcrypt.compare(password, this.password);
    }
  }