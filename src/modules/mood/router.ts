import { Router } from 'express';
import { createMood, updateMood, getTodayMood, getMoodList } from './controller';
import { requireAuth } from '../../auth/middleware';

const router = Router();

// All mood routes require authentication
router.use(requireAuth as any);

router.get('/mood-entries', getMoodList as any);
router.post('/mood-entries', createMood as any);
router.put('/mood-entries/:id', updateMood as any);

export default router;
