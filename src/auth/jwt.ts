import jwt from 'jsonwebtoken';
import env from '../config/env';
import { AppError } from '../utils/errors';

export interface JWTPayload {
  sub: string;
  scope: string;
  iat: number;
  exp: number;
}

export function generateToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      scope: 'user',
    },
    env.JWT_SECRET,
    {
      expiresIn: '7d',
      issuer: 'wetwo-backend',
      audience: 'wetwo-app',
    }
  );
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'wetwo-backend',
      audience: 'wetwo-app',
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized('Invalid token');
    }
    throw AppError.unauthorized('Token verification failed');
  }
}
