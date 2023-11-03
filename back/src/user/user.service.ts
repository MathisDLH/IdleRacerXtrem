import {Injectable} from '@nestjs/common';

import {User} from './user.entity';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {UserUpgrade} from "../UserUpgrade/userUpgrade.entity";
import {use} from "passport";

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(UserUpgrade) private readonly userUpgradeRepository: Repository<UserUpgrade>) { }


    async findById(id: number): Promise<User> {
        //FIXME: FIX THIS
        const t = await this.userRepository.find({ where: { id: id }, relations: { userUpgrade: true } });
        return t[0];
        //return await this.userRepository.findOne({where: {id:id}, relations: { userUpgrade:true }});
    }

    async update(user: User) {
        await this.userRepository.save(user);
    }


}