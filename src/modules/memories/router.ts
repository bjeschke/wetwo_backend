import { Router } from 'express';
import { getMemories, createMemory, updateMemory, deleteMemory } from './controller';
import { requireAuth } from '../../auth/middleware';

const router = Router();

// All memory routes require authentication
router.use(requireAuth as any);

router.get('/memories', getMemories as any);
router.post('/memories', createMemory as any);
router.put('/memories/:id', updateMemory as any);
router.delete('/memories/:id', deleteMemory as any);

export default router;
