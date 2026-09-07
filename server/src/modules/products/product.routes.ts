import { Router } from 'express';
import multer from 'multer';
import { productController } from './product.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { createProductSchema, updateProductSchema, productQuerySchema } from './product.validation';
import { UserRole } from '../../common/constants/roles';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

// Products listing and CSV Export (authenticated)
router.get('/', authenticate, validate({ query: productQuerySchema }), productController.getAll);
router.get('/export/csv', authenticate, productController.exportCsv);

// CSV Import (Admin / Staff)
router.post(
  '/import/csv',
  authenticate,
  authorize(UserRole.ADMIN),
  upload.single('file'),
  productController.importCsv
);

// Single Product details
router.get('/:id', authenticate, productController.getById);

// Create Product
router.post(
  '/',
  authenticate,
  validate(createProductSchema),
  productController.create
);

// Update Product
router.patch(
  '/:id',
  authenticate,
  validate(updateProductSchema),
  productController.update
);

// Delete Product (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  productController.delete
);

export const productRoutes = router;
