import { TypeormExceptionFilter } from './typeormException.filter';
import { QueryFailedError } from 'typeorm';
import { Logger } from '@nestjs/common';

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
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

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

  it('formats unknown driver errors', () => {
    const filter = new TypeormExceptionFilter();
    const error = new QueryFailedError('query', [], { code: 'SOME_CODE' } as any);
    const host = createArgumentsHost();

    filter.catch(error, host);

    expect(host.response.status).toHaveBeenCalledWith(500);
    expect(host.response.json).toHaveBeenCalledWith({
      message: 'Error while creating user',
      statusCode: 500,
      path: '/test',
    });
  });

  it('handles non-QueryFailedError errors', () => {
    const filter = new TypeormExceptionFilter();
    const error = new Error('oops');
    const host = createArgumentsHost();

    filter.catch(error as any, host);

    expect(host.response.status).toHaveBeenCalledWith(500);
    expect(host.response.json).toHaveBeenCalledWith({
      message: undefined,
      statusCode: 500,
      path: '/test',
    });
  });
});
