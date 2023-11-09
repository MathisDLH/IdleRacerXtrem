import {Injectable} from '@nestjs/common';

import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {User} from "../user/user.entity";
import {Skin} from "./skin.entity";

@Injectable()
export class SkinService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(Skin) private readonly skinRepository: Repository<Skin>) {
    }


    async findAll(): Promise<Skin[]> {
        return await this.skinRepository.find();
    }

    async purchase(skinId: number, userId: number) {
        const user = await this.userRepository.findOneBy({id: userId});
        const ownedSkins = new Set(user.ownedSkins);
        ownedSkins.add(skinId.toString());
        user.ownedSkins = Array.from(ownedSkins.values());
        return user.save();
    }
}