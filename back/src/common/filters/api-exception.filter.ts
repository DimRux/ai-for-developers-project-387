import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorBody, ApiException } from '../exceptions/api.exception';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ApiException) {
      const body = exception.getResponse() as ApiErrorBody;
      response.status(exception.getStatus()).json(body);
      return;
    }

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const status = exception.getStatus();

      if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;

        // Preserve code from ApiException-style responses
        if ('code' in obj && typeof obj.code === 'string') {
          response.status(status).json({
            code: obj.code,
            message: typeof obj.message === 'string' ? obj.message : String(obj.message),
            ...(obj.details ? { details: obj.details } : {}),
          });
          return;
        }

        if ('message' in obj) {
          const messages = Array.isArray(obj.message) ? obj.message : [obj.message as string];
          response.status(status).json({
            code: 'VALIDATION_ERROR',
            message: messages.join('; '),
            details: { errors: messages },
          });
          return;
        }
      }

      response.status(status).json({
        code: 'VALIDATION_ERROR',
        message: String(res),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: 'VALIDATION_ERROR',
      message: 'Internal server error',
    });
  }
}
