import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../db/client';
import { AuthenticatedRequest } from '../../auth/middleware';
import { sendSuccess, sendError } from '../../utils/http';
import { AppError } from '../../utils/errors';
import { updateProfileSchema, UpdateProfileRequest } from './dto';
import { toUtcStartOfDay, zodiacFromDate } from '../../utils/date';
import logger from '../../config/logger';

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return sendError(res, 'NOT_FOUND', 'Profile not found', 404);
    }

    sendSuccess(res, profile);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error getting profile');
    sendError(res, 'INTERNAL', 'Failed to get profile', 500);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validationResult = updateProfileSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(
        res,
        'BAD_REQUEST',
        'Invalid request data',
        400,
        validationResult.error.errors
      );
    }

    const data: UpdateProfileRequest = validationResult.data;
    const updateData: any = {
      name: data.name,
    };

    if (data.photoUrl !== undefined) {
      updateData.profilePhotoUrl = data.photoUrl;
    }

    if (data.birthDate) {
      const birthDate = toUtcStartOfDay(data.birthDate);
      const zodiacSign = zodiacFromDate(birthDate);
      
      updateData.birthDate = birthDate;
      updateData.zodiacSign = zodiacSign;
    }

    const profile = await prisma.profile.upsert({
      where: { id: req.user.id },
      update: updateData,
      create: {
        id: req.user.id,
        name: data.name,
        birthDate: data.birthDate ? toUtcStartOfDay(data.birthDate) : new Date('1990-01-01'),
        zodiacSign: data.birthDate ? zodiacFromDate(toUtcStartOfDay(data.birthDate)) : 'unknown',
        profilePhotoUrl: data.photoUrl || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    logger.info({ userId: req.user.id, profileId: profile.id }, 'Profile updated');
    sendSuccess(res, profile);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error updating profile');
    sendError(res, 'INTERNAL', 'Failed to update profile', 500);
  }
}
