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
        const t = await this.userRepository.find({ where: { id: id }, relations: { userUpgrade: true } });
        return t[0];
    }

    async update(user: User) {
        user.updatedAt = new Date();
        await this.userRepository.save(user);
    }

    async findUsersByScore(): Promise<User[]> {
        try {
            const users = await this.userRepository.find({});
            users.sort((a, b) => {
                const uniteA = a.money_unite;
                const uniteB = b.money_unite;
                if (uniteA === uniteB) {          
                    return b.money - a.money;
                } else {
                    return uniteB - uniteA;
                }
            });
            return users;
        } catch (error) {
            throw new Error('Erreur lors de la récupération des utilisateurs triés par score.');
        }
    }
}