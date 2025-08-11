import { Router } from 'express';
import { appleSignIn } from './controller';

const router = Router();

router.post('/auth/apple', appleSignIn);

export default router;
