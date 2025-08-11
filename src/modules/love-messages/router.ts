import { Router } from 'express';
import { getLoveMessages, createLoveMessage } from './controller';
import { requireAuth } from '../../auth/middleware';

const router = Router();

// All love message routes require authentication
router.use(requireAuth as any);

router.get('/love-messages', getLoveMessages as any);
router.post('/love-messages', createLoveMessage as any);

export default router;
