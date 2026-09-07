import { Router } from 'express';
import { categoryController } from './category.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { createCategorySchema, updateCategorySchema } from './category.validation';
import { UserRole } from '../../common/constants/roles';

const router = Router();

// Public/Authenticated reading
router.get('/', authenticate, categoryController.getAll);
router.get('/:id', authenticate, categoryController.getById);

// Create, Update, Delete (Protected: Authenticated users / Admins)
router.post(
  '/',
  authenticate,
  validate(createCategorySchema),
  categoryController.create
);

router.patch(
  '/:id',
  authenticate,
  validate(updateCategorySchema),
  categoryController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  categoryController.delete
);

export const categoryRoutes = router;
