import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../db/client';
import { sendSuccess, sendError } from '../../utils/http';
import { AppError } from '../../utils/errors';
import { verifyAppleIdToken } from '../../auth/apple';
import { generateToken } from '../../auth/jwt';
import env from '../../config/env';
import logger from '../../config/logger';

const appleSignInSchema = z.object({
  idToken: z.string(),
});

export async function appleSignIn(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = appleSignInSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(
        res,
        'BAD_REQUEST',
        'Invalid request data',
        400,
        validationResult.error.errors
      );
    }

    const { idToken } = validationResult.data;

    // Verify Apple ID token
    const appleData = await verifyAppleIdToken(
      idToken,
      env.APPLE_AUDIENCE,
      env.APPLE_ISSUER
    );

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { 
        profile: {
          appleUserId: appleData.sub
        }
      },
      include: { profile: true },
    });

    if (!user) {
      // Create new user and profile
      user = await prisma.user.create({
        data: {
          email: appleData.email || 'apple_user_' + appleData.sub,
          passwordHash: 'apple_auth_' + appleData.sub, // Placeholder for Apple auth
          name: 'Apple User',
          birthDate: new Date('1990-01-01'), // Default birth date
          profile: {
            create: {
              name: 'Apple User',
              birthDate: new Date('1990-01-01'),
              zodiacSign: 'unknown',
              appleUserId: appleData.sub,
            },
          },
        },
        include: { profile: true },
      });

      logger.info({ userId: user.id, appleSub: appleData.sub }, 'New user created via Apple Sign-In');
    }

    if (!user) {
      return sendError(res, 'INTERNAL', 'Failed to create or find user', 500);
    }

    // Generate JWT token
    const token = generateToken(user.id);

    logger.info({ userId: user.id }, 'Apple Sign-In successful');

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
      },
      profile: user.profile,
    });
  } catch (error) {
    logger.error({ error }, 'Apple Sign-In failed');
    
    if (error instanceof AppError) {
      return sendError(res, error.code as any, error.message, error.statusCode);
    }
    
    sendError(res, 'INTERNAL', 'Authentication failed', 500);
  }
}
