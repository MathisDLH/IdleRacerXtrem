import { TypeormExceptionFilter } from './typeormException.filter';
import { QueryFailedError } from 'typeorm';

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
    response: mockResponse,
  } as any;
};

describe('TypeormExceptionFilter', () => {
  it('formats ER_DUP_ENTRY errors', () => {
    const filter = new TypeormExceptionFilter();
    const error = new QueryFailedError('query', [], { code: 'ER_DUP_ENTRY' } as any);
    const host = createArgumentsHost();

    filter.catch(error, host);

    expect(host.response.status).toHaveBeenCalledWith(409);
    expect(host.response.json).toHaveBeenCalledWith({
      message: 'User already exist',
      statusCode: 409,
      path: '/test',
    });
  });
});
