import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../db/client';
import { AuthenticatedRequest } from '../../auth/middleware';
import { sendSuccess, sendError } from '../../utils/http';
import { AppError } from '../../utils/errors';
import logger from '../../config/logger';

const createLoveMessageSchema = z.object({
  receiverId: z.string().uuid(),
  message: z.string().min(1).max(1000),
});

export async function getLoveMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { user_id } = req.query;
    
    // Check if user is requesting their own messages or has permission
    if (user_id !== req.user.id) {
      return sendError(res, 'FORBIDDEN', 'Access denied', 403);
    }

    const loveMessages = await prisma.loveMessage.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                name: true,
                profilePhotoUrl: true,
              }
            }
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                name: true,
                profilePhotoUrl: true,
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' },
    });

    sendSuccess(res, loveMessages);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error getting love messages');
    sendError(res, 'INTERNAL', 'Failed to get love messages', 500);
  }
}

export async function createLoveMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validationResult = createLoveMessageSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(
        res,
        'BAD_REQUEST',
        'Invalid request data',
        400,
        validationResult.error.errors
      );
    }

    const { receiverId, message } = validationResult.data;

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return sendError(res, 'NOT_FOUND', 'Receiver not found', 404);
    }

    // Check if user is sending message to themselves
    if (receiverId === req.user.id) {
      return sendError(res, 'BAD_REQUEST', 'Cannot send message to yourself', 400);
    }

    // Check if there's a partnership between sender and receiver
    const partnership = await prisma.partnership.findFirst({
      where: {
        OR: [
          { userId: req.user.id, partnerId: receiverId },
          { userId: receiverId, partnerId: req.user.id }
        ],
        status: 'active'
      }
    });

    if (!partnership) {
      return sendError(res, 'FORBIDDEN', 'Can only send love messages to partners', 403);
    }

    const loveMessage = await prisma.loveMessage.create({
      data: {
        senderId: req.user.id,
        receiverId,
        message,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                name: true,
                profilePhotoUrl: true,
              }
            }
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                name: true,
                profilePhotoUrl: true,
              }
            }
          }
        }
      }
    });

    logger.info({ 
      senderId: req.user.id, 
      receiverId, 
      messageId: loveMessage.id 
    }, 'Love message created');

    sendSuccess(res, loveMessage);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error creating love message');
    sendError(res, 'INTERNAL', 'Failed to create love message', 500);
  }
}
