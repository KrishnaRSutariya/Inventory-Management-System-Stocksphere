import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../common/middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, dashboardController.getMetrics);

export const dashboardRoutes = router;
