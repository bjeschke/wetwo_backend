import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../db/client';
import { AuthenticatedRequest } from '../../auth/middleware';
import { sendSuccess, sendError } from '../../utils/http';
import { AppError } from '../../utils/errors';
import logger from '../../config/logger';

const createPartnershipSchema = z.object({
  connectionCode: z.string().min(1),
});

export async function getPartnerships(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { user_id } = req.query;
    
    // Check if user is requesting their own partnerships or has permission
    if (user_id !== req.user.id) {
      return sendError(res, 'FORBIDDEN', 'Access denied', 403);
    }

    const partnerships = await prisma.partnership.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { partnerId: req.user.id }
        ]
      },
      include: {
        user: {
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
        partner: {
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
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, partnerships);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error getting partnerships');
    sendError(res, 'INTERNAL', 'Failed to get partnerships', 500);
  }
}

export async function createPartnership(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const validationResult = createPartnershipSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(
        res,
        'BAD_REQUEST',
        'Invalid request data',
        400,
        validationResult.error.errors
      );
    }

    const { connectionCode } = validationResult.data;

    // Find the partnership with this connection code
    const existingPartnership = await prisma.partnership.findUnique({
      where: { connectionCode },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!existingPartnership) {
      return sendError(res, 'NOT_FOUND', 'Invalid connection code', 404);
    }

    // Check if user is trying to connect with themselves
    if (existingPartnership.userId === req.user.id) {
      return sendError(res, 'BAD_REQUEST', 'Cannot connect with yourself', 400);
    }

    // Check if partnership already exists
    const existingConnection = await prisma.partnership.findFirst({
      where: {
        OR: [
          { userId: req.user.id, partnerId: existingPartnership.userId },
          { userId: existingPartnership.userId, partnerId: req.user.id }
        ]
      }
    });

    if (existingConnection) {
      return sendError(res, 'CONFLICT', 'Partnership already exists', 409);
    }

    // Create the partnership
    const partnership = await prisma.partnership.create({
      data: {
        userId: req.user.id,
        partnerId: existingPartnership.userId,
        connectionCode: `partner_${req.user.id}_${existingPartnership.userId}`,
        status: 'active',
      },
      include: {
        user: {
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
        partner: {
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
      userId: req.user.id, 
      partnerId: existingPartnership.userId, 
      partnershipId: partnership.id 
    }, 'Partnership created');

    sendSuccess(res, partnership);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error creating partnership');
    sendError(res, 'INTERNAL', 'Failed to create partnership', 500);
  }
}
