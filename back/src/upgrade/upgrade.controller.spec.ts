import { Test, TestingModule } from '@nestjs/testing';
import { UpgradeController } from './upgrade.controller';
import { UpgradeService } from './upgrade.service';

describe('UpgradeController', () => {
  let controller: UpgradeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpgradeController],
      providers: [UpgradeService],
    }).compile();

    controller = module.get<UpgradeController>(UpgradeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
