import {Test, TestingModule} from '@nestjs/testing';
import {UsersService} from './users.service';
import {User} from "./user.entity";
import {getRepositoryToken} from "@nestjs/typeorm";
import {Repository} from "typeorm";

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
