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

@Entity()
  export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    name: string;
  
    @Column({ select: false })
    password: string;

    @Column({default: 0})
    money: number;

    @Column({default: 1})
    skin_id: number;

    @Column({type: "enum", enum: Unit, default: Unit.UNIT})
    money_unite: Unit;

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