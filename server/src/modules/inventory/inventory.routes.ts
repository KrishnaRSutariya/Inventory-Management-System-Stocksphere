import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { adjustStockSchema, inventoryLogQuerySchema } from './inventory.validation';

const router = Router();

// Global transactions audit ledger
router.get(
  '/transactions',
  authenticate,
  validate({ query: inventoryLogQuerySchema }),
  inventoryController.getAllTransactions
);

// Stock adjustment for a specific product
router.post(
  '/:productId/adjust',
  authenticate,
  validate(adjustStockSchema),
  inventoryController.adjust
);

// Product-specific audit history
router.get('/:productId/history', authenticate, inventoryController.getProductHistory);

export const inventoryRoutes = router;
