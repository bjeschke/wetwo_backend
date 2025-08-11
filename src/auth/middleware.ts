import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/http';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return sendError(res, 'UNAUTHORIZED', 'Authorization header required', 401);
    }

    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token) {
      return sendError(res, 'UNAUTHORIZED', 'Invalid authorization header format', 401);
    }

    const payload = verifyToken(token);
    req.user = { id: payload.sub };
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.code as any, error.message, error.statusCode);
    }
    
    return sendError(res, 'UNAUTHORIZED', 'Authentication failed', 401);
  }
}
