import { upgradesData } from "./data/upgrades";
import { skinsData } from "./data/skins";

jest.mock("@nestjs/core", () => ({
  NestFactory: { createApplicationContext: jest.fn() },
}));
jest.mock("../app.module", () => ({}));
jest.mock("src/upgrade/upgrade.entity", () => ({ Upgrade: class {} }), {
  virtual: true,
});
jest.mock("src/shared/shared.model", () => ({ Unit: {} }), { virtual: true });
jest.mock("../skin/skin.entity", () => ({ Skin: class {} }), { virtual: true });

const { SeedingService } = require("./seeding.service");
const { NestFactory } = require("@nestjs/core");

describe("Seed script", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("inserts initial data on empty database", async () => {
    const mockUpgradeRepository = {
      count: jest.fn().mockResolvedValue(0),
      save: jest.fn(),
    } as any;
    const mockSkinRepository = {
      count: jest.fn().mockResolvedValue(0),
      save: jest.fn(),
    } as any;

    const seedingService = new SeedingService(
      mockUpgradeRepository,
      mockSkinRepository,
    );

    const appMock = {
      get: jest.fn().mockReturnValue(seedingService),
      close: jest.fn().mockResolvedValue(undefined),
    } as any;

    (NestFactory.createApplicationContext as jest.Mock).mockResolvedValue(
      appMock,
    );

    await jest.isolateModulesAsync(async () => {
      await import("./seed");
    });
    await new Promise(setImmediate);

    expect(mockUpgradeRepository.save).toHaveBeenCalledWith(upgradesData);
    expect(mockSkinRepository.save).toHaveBeenCalledWith(skinsData);
    expect(appMock.close).toHaveBeenCalled();
  });

  it("logs error and exits when seeding fails", async () => {
    const testError = new Error("test");
    (NestFactory.createApplicationContext as jest.Mock).mockRejectedValue(
      testError,
    );

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const processExitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as any);

    await jest.isolateModulesAsync(async () => {
      await import("./seed");
    });
    await new Promise(setImmediate);

    expect(consoleErrorSpy).toHaveBeenCalledWith("Seeding failed", testError);
    expect(processExitSpy).toHaveBeenCalledWith(1);

    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });
});
