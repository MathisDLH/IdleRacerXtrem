import { SkinController } from "./skin.controller";
import { Skin } from "./skin.entity";

describe("SkinController", () => {
  let controller: SkinController;
  const mockSkinService = {
    findAll: jest.fn(),
    purchase: jest.fn(),
  } as any;

  beforeEach(() => {
    controller = new SkinController(mockSkinService);
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns all skins", async () => {
      const skins = [{ name: "s1" }] as Skin[];
      mockSkinService.findAll.mockResolvedValue(skins);
      const result = await controller.findAll();
      expect(result).toBe(skins);
      expect(mockSkinService.findAll).toHaveBeenCalled();
    });

    it("propagates errors from service", async () => {
      const error = new Error("fail");
      mockSkinService.findAll.mockRejectedValue(error);
      await expect(controller.findAll()).rejects.toThrow(error);
    });
  });

  describe("purchase", () => {
    it("calls service with name and userId", async () => {
      mockSkinService.purchase.mockResolvedValue(undefined);
      const request = { user: { userId: 1 } } as any;
      await controller.purchase("red", request);
      expect(mockSkinService.purchase).toHaveBeenCalledWith("red", 1);
    });

    it("propagates errors from service", async () => {
      const error = new Error("fail");
      mockSkinService.purchase.mockRejectedValue(error);
      const request = { user: { userId: 1 } } as any;
      await expect(controller.purchase("red", request)).rejects.toThrow(error);
    });
  });
});
