import {Injectable} from '@nestjs/common';

import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {User} from "../user/user.entity";
import {Skin} from "./skin.entity";
import {RedisService} from "../redis/redis.service";

@Injectable()
export class SkinService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(Skin) private readonly skinRepository: Repository<Skin>,
                private readonly redisService: RedisService) {
    }


    async findAll(): Promise<Skin[]> {
        return await this.skinRepository.find();
    }

    async purchase(name: string, userId: number) {
        const user = await this.userRepository.findOneBy({id: userId});
        const skin = await this.skinRepository.findOneBy({name: name});

        if(await this.redisService.pay(userId, { value: skin.price, unit: skin.priceUnit })) {
            const ownedSkins = new Set(user.ownedSkins);
            ownedSkins.add(skin.name);
            user.ownedSkins = Array.from(ownedSkins.values());
            return user.save();
        } else {
            throw new Error("Cannot purchase skin")
        }

    }
}