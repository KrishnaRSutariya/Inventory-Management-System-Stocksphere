import { z } from 'zod';

export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name cannot exceed 200 characters'),
  sku: z
    .string()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU cannot exceed 50 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  quantity: z
    .number({ message: 'Quantity is required' })
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative'),
  unitPrice: z
    .number({ message: 'Unit price is required' })
    .positive('Unit price must be greater than zero'),
  supplierName: z
    .string()
    .min(2, 'Supplier name is required')
    .max(100, 'Supplier name cannot exceed 100 characters'),
  lowStockThreshold: z
    .number({ message: 'Threshold is required' })
    .int('Threshold must be an integer')
    .min(1, 'Threshold must be at least 1'),
  barcode: z.string().optional()
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
