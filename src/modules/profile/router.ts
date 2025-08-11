import { Router } from 'express';
import { getProfile, updateProfile } from './controller';
import { requireAuth } from '../../auth/middleware';

const router = Router();

// All profile routes require authentication
router.use(requireAuth as any);

router.get('/profiles/:id', getProfile as any);
router.put('/profiles/:id', updateProfile as any);

export default router;
