import { Response } from 'express';

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL';
    message: string;
    details?: any;
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  const response: ApiResponse<T> = { data };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL',
  message: string,
  statusCode: number,
  details?: any
): void {
  const response: ApiResponse = {
    error: {
      code,
      message,
      details,
    },
  };
  res.status(statusCode).json(response);
}
