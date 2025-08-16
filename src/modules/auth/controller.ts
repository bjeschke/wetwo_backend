import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../db/client';
import { sendSuccess, sendError } from '../../utils/http';
import { AppError } from '../../utils/errors';
import { verifyAppleIdToken } from '../../auth/apple';
import { generateToken } from '../../auth/jwt';
import env from '../../config/env';
import logger from '../../config/logger';
import bcrypt from 'bcrypt';

const appleSignInSchema = z.object({
  idToken: z.string(),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine((data) => data.birthDate || data.birth_date, {
  message: "Either birthDate or birth_date is required",
  path: ["birthDate"],
}).transform((data) => ({
  ...data,
  birthDate: data.birthDate || data.birth_date!,
}));

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string(),
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

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(
        res,
        'BAD_REQUEST',
        'Invalid request data',
        400,
        validationResult.error.errors
      );
    }

    const { email, password, name, birthDate } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError(res, 'CONFLICT', 'User with this email already exists', 409);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        birthDate: new Date(birthDate),
        profile: {
          create: {
            name,
            birthDate: new Date(birthDate),
            zodiacSign: 'unknown', // Can be calculated later
          },
        },
      },
      include: { profile: true },
    });

    // Generate JWT token
    const token = generateToken(user.id);

    logger.info({ userId: user.id }, 'User signup successful');

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      profile: user.profile,
    });
  } catch (error) {
    logger.error({ error }, 'User signup failed');
    
    if (error instanceof AppError) {
      return sendError(res, error.code as any, error.message, error.statusCode);
    }
    
    sendError(res, 'INTERNAL', 'Signup failed', 500);
  }
}

export async function signin(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = signinSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(
        res,
        'BAD_REQUEST',
        'Invalid request data',
        400,
        validationResult.error.errors
      );
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return sendError(res, 'UNAUTHORIZED', 'Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return sendError(res, 'UNAUTHORIZED', 'Invalid email or password', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const token = generateToken(user.id);

    logger.info({ userId: user.id }, 'User signin successful');

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      profile: user.profile,
    });
  } catch (error) {
    logger.error({ error }, 'User signin failed');
    
    if (error instanceof AppError) {
      return sendError(res, error.code as any, error.message, error.statusCode);
    }
    
    sendError(res, 'INTERNAL', 'Signin failed', 500);
  }
}
