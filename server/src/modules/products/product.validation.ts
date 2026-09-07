import { z } from 'zod';
import { StockStatus } from '../../common/constants/stockStatus';

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Product name is required' })
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name cannot exceed 200 characters'),
  sku: z
    .string({ required_error: 'SKU is required' })
    .trim()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU cannot exceed 50 characters')
    .transform((val) => val.toUpperCase()),
  category: z
    .string({ required_error: 'Category is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),
  description: z.string().trim().max(2000, 'Description cannot exceed 2000 characters').optional(),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative'),
  unitPrice: z
    .number({ required_error: 'Unit price is required' })
    .positive('Unit price must be greater than zero'),
  supplierName: z
    .string({ required_error: 'Supplier name is required' })
    .trim()
    .min(2, 'Supplier name must be at least 2 characters')
    .max(100, 'Supplier name cannot exceed 100 characters'),
  lowStockThreshold: z
    .number()
    .int('Threshold must be an integer')
    .min(1, 'Threshold must be at least 1')
    .optional()
    .default(10),
  barcode: z.string().trim().optional()
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name cannot exceed 200 characters')
    .optional(),
  sku: z
    .string()
    .trim()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU cannot exceed 50 characters')
    .transform((val) => val.toUpperCase())
    .optional(),
  category: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format')
    .optional(),
  description: z.string().trim().max(2000, 'Description cannot exceed 2000 characters').optional(),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative')
    .optional(),
  unitPrice: z
    .number()
    .positive('Unit price must be greater than zero')
    .optional(),
  supplierName: z
    .string()
    .trim()
    .min(2, 'Supplier name must be at least 2 characters')
    .max(100, 'Supplier name cannot exceed 100 characters')
    .optional(),
  lowStockThreshold: z
    .number()
    .int('Threshold must be an integer')
    .min(1, 'Threshold must be at least 1')
    .optional(),
  barcode: z.string().trim().optional()
});

export const productQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.nativeEnum(StockStatus).optional(),
  sortBy: z.enum(['name', 'quantity', 'unitPrice', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export type CreateProductSchemaType = z.infer<typeof createProductSchema>;
export type UpdateProductSchemaType = z.infer<typeof updateProductSchema>;
export type ProductQuerySchemaType = z.infer<typeof productQuerySchema>;
