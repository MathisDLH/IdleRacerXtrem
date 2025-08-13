import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { Request, Response } from "express";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { PurchaseError } from "../exceptions/PurchaseError";

@Catch(PurchaseError)
export class EffectiveExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const logger: Logger = new Logger(EffectiveExceptionFilter.name);
    logger.error(exception);

    response.status(400).json({
      message: exception.message,
      statusCode: 400,
      path: request.url,
    });
  }
}
