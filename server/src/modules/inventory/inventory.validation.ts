import { z } from 'zod';
import { InventoryTransactionType } from '../../common/constants/stockStatus';

export const adjustStockSchema = z.object({
  type: z.nativeEnum(InventoryTransactionType, {
    required_error: "Transaction type must be 'IN' or 'OUT'"
  }),
  quantity: z
    .number({ required_error: 'Adjustment quantity is required' })
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than 0'),
  note: z.string().trim().max(500, 'Note cannot exceed 500 characters').optional()
});

export const inventoryLogQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID').optional(),
  type: z.nativeEnum(InventoryTransactionType).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type AdjustStockSchemaType = z.infer<typeof adjustStockSchema>;
export type InventoryLogQuerySchemaType = z.infer<typeof inventoryLogQuerySchema>;
