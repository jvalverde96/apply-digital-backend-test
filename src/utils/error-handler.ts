import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponse } from 'src/types/types';
import logger from './logger';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const message = exception.getResponse();

    const apiResponse: ApiResponse = {
      success: false,
      result: null,
      metadata: {
        statusCode: status,
        message,
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      },
      error: typeof message === 'string' ? message : message['message'], // Capture error message
    };

    response.status(status).json(apiResponse);
  }
}

export const buildInternalServerErrorResponse = (
  message: string,
  error: unknown,
) => {
  logger.error(`${message}`);
  logger.error(`Error: ${error}`);
  throw new HttpException(`${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
};
