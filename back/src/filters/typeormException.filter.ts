import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { Request, Response } from "express";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";

@Catch(QueryFailedError)
export class TypeormExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const logger: Logger = new Logger(TypeormExceptionFilter.name);
    logger.error(exception);

    let status: HttpStatus;
    let message: string;

    switch (exception.constructor) {
      case QueryFailedError:
        const queryFailedException = exception as QueryFailedError;
        switch (queryFailedException.driverError.code) {
          case "ER_DUP_ENTRY":
            status = HttpStatus.CONFLICT;
            message = "User already exist";
            break;
          default:
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = "Error while creating user";
        }
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    response.status(status).json({
      message: message,
      statusCode: status,
      path: request.url,
    });
  }
}
