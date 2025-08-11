import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/http';

export function healthCheck(req: Request, res: Response): void {
  sendSuccess(res, { status: 'ok' });
}
