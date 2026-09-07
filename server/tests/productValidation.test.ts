import { describe, it, expect } from 'vitest';
import { createProductSchema } from '../src/modules/products/product.validation';
import { adjustStockSchema } from '../src/modules/inventory/inventory.validation';

describe('Zod Validation Schemas', () => {
  const validObjectId = '66f00112233445566778899a';

  describe('createProductSchema', () => {
    it('should validate and transform SKU to uppercase', () => {
      const parsed = createProductSchema.parse({
        name: 'Wireless Ergonomic Mouse',
        sku: 'ms-ergo-01',
        category: validObjectId,
        quantity: 25,
        unitPrice: 49.99,
        supplierName: 'Tech Supplies Direct'
      });

      expect(parsed.sku).toBe('MS-ERGO-01');
      expect(parsed.quantity).toBe(25);
    });

    it('should reject negative quantities', () => {
      expect(() => {
        createProductSchema.parse({
          name: 'Invalid Quantity Product',
          sku: 'INV-001',
          category: validObjectId,
          quantity: -3,
          unitPrice: 10,
          supplierName: 'Supplier'
        });
      }).toThrow('Quantity cannot be negative');
    });

    it('should reject zero or negative price', () => {
      expect(() => {
        createProductSchema.parse({
          name: 'Zero Price Item',
          sku: 'ZERO-01',
          category: validObjectId,
          quantity: 10,
          unitPrice: 0,
          supplierName: 'Supplier'
        });
      }).toThrow('Unit price must be greater than zero');
    });
  });

  describe('adjustStockSchema', () => {
    it('should accept valid IN and OUT stock transactions', () => {
      const inRes = adjustStockSchema.parse({
        type: 'IN',
        quantity: 15,
        note: 'New batch intake'
      });
      expect(inRes.type).toBe('IN');
      expect(inRes.quantity).toBe(15);

      const outRes = adjustStockSchema.parse({
        type: 'OUT',
        quantity: 5
      });
      expect(outRes.type).toBe('OUT');
    });

    it('should reject non-positive quantities for adjustment', () => {
      expect(() => {
        adjustStockSchema.parse({
          type: 'IN',
          quantity: 0
        });
      }).toThrow();
    });
  });
});
