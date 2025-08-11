import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../db/client';
import { AuthenticatedRequest } from '../../auth/middleware';
import { sendSuccess, sendError } from '../../utils/http';
import { AppError } from '../../utils/errors';
import { 
  createMoodSchema, 
  updateMoodSchema, 
  moodListQuerySchema,
  CreateMoodRequest,
  UpdateMoodRequest,
  MoodListQuery
} from './dto';
import { toUtcStartOfDay, todayUtcStartOfDay } from '../../utils/date';
import logger from '../../config/logger';

export async function createMood(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validationResult = createMoodSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(
        res,
        'BAD_REQUEST',
        'Invalid request data',
        400,
        validationResult.error.errors
      );
    }

    const data: CreateMoodRequest = validationResult.data;
    const date = data.date ? toUtcStartOfDay(data.date) : todayUtcStartOfDay();

    // Check if mood entry already exists for this date
    const existingEntry = await prisma.moodEntry.findUnique({
      where: {
        userId_date: {
          userId: req.user.id,
          date,
        },
      },
    });

    if (existingEntry) {
      return sendError(
        res,
        'CONFLICT',
        'Mood entry already exists for this date. Use PUT /moods/:id to update.',
        409,
        { existingEntryId: existingEntry.id }
      );
    }

    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: req.user.id,
        date,
        moodLevel: data.moodLevel,
        eventLabel: data.eventLabel || null,
        photoData: data.photoUrl || null,
      },
    });

    logger.info({ userId: req.user.id, moodId: moodEntry.id, date }, 'Mood entry created');
    sendSuccess(res, moodEntry, 201);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error creating mood entry');
    sendError(res, 'INTERNAL', 'Failed to create mood entry', 500);
  }
}

export async function updateMood(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const validationResult = updateMoodSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(
        res,
        'BAD_REQUEST',
        'Invalid request data',
        400,
        validationResult.error.errors
      );
    }

    const data: UpdateMoodRequest = validationResult.data;

    // Check if mood entry exists and belongs to user
    const existingEntry = await prisma.moodEntry.findFirst({
      where: {
        id: id || '',
        userId: req.user.id,
      },
    });

    if (!existingEntry) {
      return sendError(res, 'NOT_FOUND', 'Mood entry not found', 404);
    }

    const updateData: any = {};
    if (data.moodLevel !== undefined) updateData.moodLevel = data.moodLevel;
    if (data.eventLabel !== undefined) updateData.eventLabel = data.eventLabel;

    const moodEntry = await prisma.moodEntry.update({
      where: { id: id || '' },
      data: updateData,
    });

    logger.info({ userId: req.user.id, moodId: moodEntry.id }, 'Mood entry updated');
    sendSuccess(res, moodEntry);
  } catch (error) {
    logger.error({ error, userId: req.user.id, moodId: req.params.id }, 'Error updating mood entry');
    sendError(res, 'INTERNAL', 'Failed to update mood entry', 500);
  }
}

export async function getTodayMood(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const today = todayUtcStartOfDay();

    const moodEntry = await prisma.moodEntry.findUnique({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today,
        },
      },
    });

    if (!moodEntry) {
      return sendError(res, 'NOT_FOUND', 'No mood entry found for today', 404);
    }

    sendSuccess(res, moodEntry);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error getting today mood');
    sendError(res, 'INTERNAL', 'Failed to get today mood', 500);
  }
}

export async function getMoodList(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validationResult = moodListQuerySchema.safeParse(req.query);
    
    if (!validationResult.success) {
      return sendError(
        res,
        'BAD_REQUEST',
        'Invalid query parameters',
        400,
        validationResult.error.errors
      );
    }

    const { from, to }: MoodListQuery = validationResult.data;
    const fromDate = toUtcStartOfDay(from);
    const toDate = toUtcStartOfDay(to);

    if (fromDate > toDate) {
      return sendError(res, 'BAD_REQUEST', 'From date must be before or equal to to date', 400);
    }

    const moodEntries = await prisma.moodEntry.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    sendSuccess(res, moodEntries);
  } catch (error) {
    logger.error({ error, userId: req.user.id, query: req.query }, 'Error getting mood list');
    sendError(res, 'INTERNAL', 'Failed to get mood list', 500);
  }
}
