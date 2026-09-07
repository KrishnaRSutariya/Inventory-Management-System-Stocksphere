import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { categoryRoutes } from '../modules/categories/category.routes';
import { productRoutes } from '../modules/products/product.routes';
import { inventoryRoutes } from '../modules/inventory/inventory.routes';
import { dashboardRoutes } from '../modules/dashboard/dashboard.routes';
import { ApiResponse } from '../common/utils/ApiResponse';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  return ApiResponse.success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }, 'System is fully operational');
});

// Version 1 Routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/dashboard', dashboardRoutes);

export const apiRoutes = router;
