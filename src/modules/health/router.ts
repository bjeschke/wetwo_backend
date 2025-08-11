import { Router } from 'express';
import { healthCheck } from './controller';

const router = Router();

router.get('/health', healthCheck);

export default router;
