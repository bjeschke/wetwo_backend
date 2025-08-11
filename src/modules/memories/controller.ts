import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../db/client';
import { AuthenticatedRequest } from '../../auth/middleware';
import { sendSuccess, sendError } from '../../utils/http';
import { AppError } from '../../utils/errors';
import logger from '../../config/logger';

const createMemorySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1),
  description: z.string().optional(),
  photoData: z.string().optional(),
  location: z.string().optional(),
  moodLevel: z.string(),
  tags: z.string().optional(),
  isShared: z.string().default('false'),
});

const updateMemorySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  photoData: z.string().optional(),
  location: z.string().optional(),
  moodLevel: z.string().optional(),
  tags: z.string().optional(),
  isShared: z.string().optional(),
});

export async function getMemories(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { user_id } = req.query;
    
    // Check if user is requesting their own memories or has permission
    if (user_id !== req.user.id) {
      // For now, only allow users to access their own memories
      // In the future, this could be extended to allow partners to view shared memories
      return sendError(res, 'FORBIDDEN', 'Access denied', 403);
    }

    const memories = await prisma.memory.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
    });

    sendSuccess(res, memories);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error getting memories');
    sendError(res, 'INTERNAL', 'Failed to get memories', 500);
  }
}

export async function createMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validationResult = createMemorySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(
        res,
        'BAD_REQUEST',
        'Invalid request data',
        400,
        validationResult.error.errors
      );
    }

    const data = validationResult.data;

    const memory = await prisma.memory.create({
      data: {
        userId: req.user.id,
        date: new Date(data.date),
        title: data.title,
        description: data.description || null,
        photoData: data.photoData || null,
        location: data.location || null,
        moodLevel: data.moodLevel,
        tags: data.tags || null,
        isShared: data.isShared,
      },
    });

    logger.info({ userId: req.user.id, memoryId: memory.id }, 'Memory created');
    sendSuccess(res, memory);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error creating memory');
    sendError(res, 'INTERNAL', 'Failed to create memory', 500);
  }
}

export async function updateMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    if (!id) {
      return sendError(res, 'BAD_REQUEST', 'Memory ID is required', 400);
    }
    
    const validationResult = updateMemorySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(
        res,
        'BAD_REQUEST',
        'Invalid request data',
        400,
        validationResult.error.errors
      );
    }

    // Check if memory exists and belongs to user
    const existingMemory = await prisma.memory.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existingMemory) {
      return sendError(res, 'NOT_FOUND', 'Memory not found', 404);
    }

    const data = validationResult.data;
    const updateData: any = {};

    if (data.date) updateData.date = new Date(data.date);
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.photoData !== undefined) updateData.photoData = data.photoData || null;
    if (data.location !== undefined) updateData.location = data.location || null;
    if (data.moodLevel) updateData.moodLevel = data.moodLevel;
    if (data.tags !== undefined) updateData.tags = data.tags || null;
    if (data.isShared !== undefined) updateData.isShared = data.isShared;

    const memory = await prisma.memory.update({
      where: { id },
      data: updateData,
    });

    logger.info({ userId: req.user.id, memoryId: memory.id }, 'Memory updated');
    sendSuccess(res, memory);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error updating memory');
    sendError(res, 'INTERNAL', 'Failed to update memory', 500);
  }
}

export async function deleteMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, 'BAD_REQUEST', 'Memory ID is required', 400);
    }

    // Check if memory exists and belongs to user
    const existingMemory = await prisma.memory.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existingMemory) {
      return sendError(res, 'NOT_FOUND', 'Memory not found', 404);
    }

    await prisma.memory.delete({
      where: { id },
    });

    logger.info({ userId: req.user.id, memoryId: id }, 'Memory deleted');
    sendSuccess(res, { message: 'Memory deleted successfully' });
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error deleting memory');
    sendError(res, 'INTERNAL', 'Failed to delete memory', 500);
  }
}
