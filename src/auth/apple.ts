import { jwtVerify, createRemoteJWKSet } from 'jose';
import env from '../config/env';
import { AppError } from '../utils/errors';
import logger from '../config/logger';

const JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

export interface AppleIdTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  email?: string;
  email_verified?: string;
  is_private_email?: string;
}

export async function verifyAppleIdToken(
  idToken: string,
  audience: string,
  issuer: string
): Promise<{ sub: string; email?: string }> {
  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer,
      audience,
      algorithms: ['RS256'],
    });

    const applePayload = payload as AppleIdTokenPayload;

    // Verify required fields
    if (!applePayload.sub) {
      throw AppError.badRequest('Invalid Apple ID token: missing sub');
    }

    if (applePayload.iss !== issuer) {
      throw AppError.badRequest('Invalid Apple ID token: wrong issuer');
    }

    if (applePayload.aud !== audience) {
      throw AppError.badRequest('Invalid Apple ID token: wrong audience');
    }

    logger.info({ sub: applePayload.sub, email: applePayload.email }, 'Apple ID token verified');

    const result: { sub: string; email?: string } = {
      sub: applePayload.sub,
    };
    
    if (applePayload.email) {
      result.email = applePayload.email;
    }
    
    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    logger.error({ error }, 'Apple ID token verification failed');
    throw AppError.badRequest('Invalid Apple ID token');
  }
}
