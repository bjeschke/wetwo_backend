import { Router } from 'express';
import { getNotifications, markNotificationAsRead } from './controller';
import { requireAuth } from '../../auth/middleware';

const router = Router();

// All notification routes require authentication
router.use(requireAuth as any);

router.get('/notifications', getNotifications as any);
router.put('/notifications/:id/read', markNotificationAsRead as any);

export default router;
