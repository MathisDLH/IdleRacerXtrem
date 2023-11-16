import {BaseEntity, Column, Entity, PrimaryGeneratedColumn,} from 'typeorm';
import {ApiProperty} from "@nestjs/swagger";
import {Unit} from "../shared/shared.model";


@Entity()
export class Skin extends BaseEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({type: 'float', default: 0})
    price: number;

    @ApiProperty()
    @Column({type: "enum", enum: Unit, default: Unit.UNIT})
    priceUnit: Unit;

    @ApiProperty()
    @Column()
    name: string;
}