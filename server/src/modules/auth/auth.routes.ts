import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { registerSchema, loginSchema } from './auth.validation';
import { authenticate } from '../../common/middleware/auth.middleware';
import { authLimiter } from '../../common/middleware/rateLimit.middleware';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);

export const authRoutes = router;
