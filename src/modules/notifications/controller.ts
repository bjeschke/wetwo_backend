import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../db/client';
import { AuthenticatedRequest } from '../../auth/middleware';
import { sendSuccess, sendError } from '../../utils/http';
import { AppError } from '../../utils/errors';
import logger from '../../config/logger';

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { user_id } = req.query;
    
    // Check if user is requesting their own notifications or has permission
    if (user_id !== req.user.id) {
      return sendError(res, 'FORBIDDEN', 'Access denied', 403);
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { sentAt: 'desc' },
    });

    sendSuccess(res, notifications);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error getting notifications');
    sendError(res, 'INTERNAL', 'Failed to get notifications', 500);
  }
}

export async function markNotificationAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, 'BAD_REQUEST', 'Notification ID is required', 400);
    }

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existingNotification) {
      return sendError(res, 'NOT_FOUND', 'Notification not found', 404);
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    logger.info({ userId: req.user.id, notificationId: notification.id }, 'Notification marked as read');
    sendSuccess(res, notification);
  } catch (error) {
    logger.error({ error, userId: req.user.id }, 'Error marking notification as read');
    sendError(res, 'INTERNAL', 'Failed to mark notification as read', 500);
  }
}
