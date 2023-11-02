import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn, JoinTable,
  ManyToMany,
  ManyToOne, OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {User} from "../users/user.entity";
import {Unit} from "../shared/shared.model";
import {UserUpgrade} from "../UserUpgrade/userUpgrade.entity";

@Entity()
  export class Upgrade extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    
    @Column()
    price: number;

    @Column({type: "enum", enum: Unit, default: Unit.UNIT})
    price_unit: Unit;

    @Column()
    ratio: number;

    @Column()
    generationUpgradeId: number;

    @Column('float', {comment: "Nombre de type généré"})
    value: number;

  @OneToMany(() => UserUpgrade, userUpgrade => userUpgrade.upgrade)
  public userUpgrade: User[];
  }