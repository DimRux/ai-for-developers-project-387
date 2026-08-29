import { HttpException, HttpStatus } from '@nestjs/common';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'EVENT_TYPE_NOT_FOUND'
  | 'EVENT_TYPE_ID_CONFLICT'
  | 'BOOKING_NOT_FOUND'
  | 'SLOT_TAKEN'
  | 'SLOT_OUT_OF_WINDOW'
  | 'SLOT_NOT_ALIGNED';

export interface ApiErrorBody {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export class ApiException extends HttpException {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, status: HttpStatus, details?: Record<string, unknown>) {
    super({ code, message, details } as ApiErrorBody, status);
    this.code = code;
    this.details = details;
  }
}
