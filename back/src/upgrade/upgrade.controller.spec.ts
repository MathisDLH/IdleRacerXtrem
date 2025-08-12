import { UpgradeController } from './upgrade.controller';
import { Unit } from '../shared/shared.model';

jest.mock(
  'src/auth/jwt-auth.guard',
  () => {
    class JwtAuthGuard {
      canActivate() {
        return true;
      }
    }
    return { JwtAuthGuard };
  },
  { virtual: true },
);
jest.mock(
  '../filters/EffectiveException.filter',
  () => {
    class EffectiveExceptionFilter {
      catch() {}
    }
    return { EffectiveExceptionFilter };
  },
  { virtual: true },
);
jest.mock('../game/game.gateway', () => ({}), { virtual: true });
jest.mock('./upgrade.service', () => ({ UpgradeService: jest.fn() }), {
  virtual: true,
});

describe('UpgradeController', () => {
  let controller: UpgradeController;
  const mockUpgradeService = {
    findAll: jest.fn(),
    buyUpgrade: jest.fn(),
    buyClick: jest.fn(),
  };
  const mockGameGateway = {
    socketConnected: new Set([{ userId: 1 }]),
    emitMoney: jest.fn(),
    emitUpgrade: jest.fn(),
  } as any;

  beforeEach(() => {
    controller = new UpgradeController(mockUpgradeService as any, mockGameGateway);
    jest.clearAllMocks();
    mockGameGateway.socketConnected = new Set([{ userId: 1 }]);
  });

  it('findAll returns upgrades', async () => {
    const upgrades = [{ id: 1 }];
    mockUpgradeService.findAll.mockResolvedValue(upgrades);
    const result = await controller.findAll();
    expect(result).toBe(upgrades);
    expect(mockUpgradeService.findAll).toHaveBeenCalled();
  });

  it('buyUpgrade calls service and emits events', async () => {
    const dto = { upgradeId: '1', quantity: '1' };
    await controller.buyUpgrade(dto as any, { user: { userId: 1 } });
    expect(mockUpgradeService.buyUpgrade).toHaveBeenCalledWith(dto, 1);
    expect(mockGameGateway.emitMoney).toHaveBeenCalled();
    expect(mockGameGateway.emitUpgrade).toHaveBeenCalled();
  });

  it('buyClick returns service result and emits events', async () => {
    const data = { amount: 100, unit: Unit.UNIT };
    const serviceResult = { amount: 1, unit: Unit.UNIT };
    mockUpgradeService.buyClick.mockResolvedValue(serviceResult);
    const result = await controller.buyClick(data, { user: { userId: 1 } });
    expect(mockUpgradeService.buyClick).toHaveBeenCalledWith(100, Unit.UNIT, 1);
    expect(mockGameGateway.emitMoney).toHaveBeenCalled();
    expect(mockGameGateway.emitUpgrade).toHaveBeenCalled();
    expect(result).toEqual(serviceResult);
  });
});
