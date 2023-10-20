import {Injectable} from '@nestjs/common';

import {User} from './user.entity';
import {CreateUserDto} from './dto/create-user.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {UserUpgrade} from "../UserUpgrade/userUpgrade.entity";

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, @InjectRepository(UserUpgrade) private readonly userUpgradeRepository: Repository<UserUpgrade>) {}
    async create(createUserDto: CreateUserDto) {
        let user = this.userRepository.create({...createUserDto} );
        user = await user.save();
        return user;
 }

  async findById(id: number): Promise<User> {
      const t =await this.userRepository.find({where: {id:id}, relations: { userUpgrade:true }});
      return t[0];
      //return await this.userRepository.findOne({where: {id:id}, relations: { userUpgrade:true }});
  }

  async findByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({where: {email}, select: ["id", "email", "password"]});
    }
}