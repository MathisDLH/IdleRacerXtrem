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

    async findUsersByScore(): Promise<User[]> {
        const numberUnits = [
          { name: "UNIT", value: 1 },
          { name: "MILLION", value: 2 },
          { name: "BILLION", value: 3 },
          { name: "TRILLION", value: 4 },
          { name: "QUADRILLION", value: 5 },
          { name: "QUINTILLION", value: 6 },
          { name: "SEXTILLION", value: 7 },
          { name: "SEPTILLION", value: 8 },
          { name: "OCTILLION", value: 9 },
          { name: "NONILLION", value: 10 },
          { name: "DECILLION", value: 11 },
          { name: "UNDECILLION", value: 12 },
          { name: "DUODECILLION", value: 13 },
          { name: "TREDECILLION", value: 14 },
          { name: "QUATTUORDECILLION", value: 15 },
          { name: "QUINDECILLION", value: 16 },
          { name: "SEXDECILLION", value: 17 },
          { name: "SEPTENDECILLION", value: 18 },
          { name: "OCTODECILLION", value: 19 },
          { name: "NOVEMDECILLION", value: 20 },
          { name: "VIGINTILLION", value: 21 },
          { name: "UNVIGINTILLION", value: 22 },
          { name: "DUOVIGINTILLION", value: 23 },
          { name: "TRESVIGINTILLION", value: 24 },
          { name: "QUATTUORVIGINTILLION", value: 25 },
          { name: "QUINQUAVIGINTILLION", value: 26 },
          { name: "SESVIGINTILLION", value: 27 },
          { name: "SEPTENVIGINTILLION", value: 28 },
          { name: "OCTOVIGINTILLION", value: 29 },
          { name: "NOVEMVIGINTILLION", value: 30 },
          { name: "TRIGINTILLION", value: 31 },
          { name: "UNTRIGINTILLION", value: 32 },
          { name: "DUOTRIGINTILLION", value: 33 },
          { name: "TRESTRIGINTILLION", value: 34 },
          { name: "QUATTUORTRIGINTILLION", value: 35 },
          { name: "QUINQUATRIGINTILLION", value: 36 },
          { name: "SESTRIGINTILLION", value: 37 },
        ];
    
        try {
          const users = await this.userRepository.find({});
          
          users.sort((a, b) => {
            // Compare les unités d'argent en fonction de l'ordre de priorité
            
           
          const uniteA = numberUnits.find(unit => unit.name === a.money_unite)?.value;
            
           
          const uniteB = numberUnits.find(unit => unit.name === b.money_unite)?.value;
          console.log(uniteA, uniteB)
            if (uniteA === uniteB) {          
          return b.money - a.money;
            } else {
              // Si les unités sont différentes, compare en fonction de l'ordre de priorité
              return uniteB - uniteA;
            }
          });
          console.log(users);
          return users;
        } catch (error) {
          throw new Error('Erreur lors de la récupération des utilisateurs triés par score.');
        }
      }
}