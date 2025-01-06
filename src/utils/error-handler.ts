import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { ApiResponse } from 'src/types/types';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const message = exception.getResponse();

    // Construct the ApiResponse structure
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

    // Send the response
    response.status(status).json(apiResponse);
  }
}
