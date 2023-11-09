import {BaseEntity, Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn,} from 'typeorm';
import {ApiProperty} from "@nestjs/swagger";
import {User} from "../user/user.entity";


@Entity()
export class Skin extends BaseEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    price: number;
}