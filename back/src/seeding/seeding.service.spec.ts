import { upgradesData } from "./data/upgrades";
import { skinsData } from "./data/skins";

jest.mock("src/upgrade/upgrade.entity", () => ({ Upgrade: class {} }), {
  virtual: true,
});
jest.mock("src/shared/shared.model", () => ({ Unit: {} }), {
  virtual: true,
});

const { SeedingService } = require("./seeding.service");

describe("SeedingService", () => {
  let service: any;
  const mockUpgradeRepository = {
    count: jest.fn(),
    save: jest.fn(),
  } as any;
  const mockSkinRepository = {
    count: jest.fn(),
    save: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SeedingService(mockUpgradeRepository, mockSkinRepository);
  });

  it("seeds upgrades and skins when repositories are empty", async () => {
    mockUpgradeRepository.count.mockResolvedValue(0);
    mockSkinRepository.count.mockResolvedValue(0);

    await service.run();

    expect(mockUpgradeRepository.save).toHaveBeenCalledWith(upgradesData);
    expect(mockSkinRepository.save).toHaveBeenCalledWith(skinsData);
  });

  it("onModuleInit seeds upgrades and skins when repositories are empty", async () => {
    mockUpgradeRepository.count.mockResolvedValue(0);
    mockSkinRepository.count.mockResolvedValue(0);

    await service.onModuleInit();

    expect(mockUpgradeRepository.save).toHaveBeenCalledWith(upgradesData);
    expect(mockSkinRepository.save).toHaveBeenCalledWith(skinsData);
  });

  it("does not seed when repositories are already populated", async () => {
    mockUpgradeRepository.count.mockResolvedValue(1);
    mockSkinRepository.count.mockResolvedValue(1);

    await service.run();

    expect(mockUpgradeRepository.save).not.toHaveBeenCalled();
    expect(mockSkinRepository.save).not.toHaveBeenCalled();
  });
});
