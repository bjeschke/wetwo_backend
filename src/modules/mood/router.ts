import { Router } from 'express';
import { createMood, updateMood, getTodayMood, getMoodList } from './controller';
import { requireAuth } from '../../auth/middleware';

const router = Router();

// All mood routes require authentication
router.use(requireAuth as any);

router.post('/moods', createMood as any);
router.put('/moods/:id', updateMood as any);
router.get('/moods/today', getTodayMood as any);
router.get('/moods', getMoodList as any);

export default router;
