import { Router } from 'express';
import { appleSignIn, signup, signin } from './controller';

const router = Router();

router.post('/auth/signup', signup);
router.post('/auth/signin', signin);
router.post('/auth/apple', appleSignIn);

export default router;
