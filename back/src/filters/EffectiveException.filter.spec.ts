import { EffectiveExceptionFilter } from './EffectiveException.filter';
import { PurchaseError } from '../exceptions/PurchaseError';

// mock ArgumentsHost
const createArgumentsHost = () => {
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const mockRequest = { url: '/test' };
  return {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
      getRequest: () => mockRequest,
    }),
    // expose mocks for assertions
    response: mockResponse,
  } as any;
};

describe('EffectiveExceptionFilter', () => {
  it('formats PurchaseError response', () => {
    const filter = new EffectiveExceptionFilter();
    const error = new PurchaseError('1', '2');
    const host = createArgumentsHost();

    filter.catch(error as any, host);

    expect(host.response.status).toHaveBeenCalledWith(400);
    expect(host.response.json).toHaveBeenCalledWith({
      message: error.message,
      statusCode: 400,
      path: '/test',
    });
  });
});
