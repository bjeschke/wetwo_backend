import { Router } from 'express';
import { getPartnerships, createPartnership } from './controller';
import { requireAuth } from '../../auth/middleware';

const router = Router();

// All partnership routes require authentication
router.use(requireAuth as any);

router.get('/partnerships', getPartnerships as any);
router.post('/partnerships', createPartnership as any);

export default router;
