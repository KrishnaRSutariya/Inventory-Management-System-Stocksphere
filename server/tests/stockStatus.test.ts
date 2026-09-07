import { describe, it, expect } from 'vitest';
import { calculateStockStatus } from '../src/common/utils/stockStatus';
import { StockStatus } from '../src/common/constants/stockStatus';

describe('Stock Status Calculation Engine', () => {
  it('should return OUT_OF_STOCK when quantity is 0 or less', () => {
    expect(calculateStockStatus(0, 10)).toBe(StockStatus.OUT_OF_STOCK);
    expect(calculateStockStatus(-5, 10)).toBe(StockStatus.OUT_OF_STOCK);
  });

  it('should return LOW_STOCK when quantity is greater than 0 but <= threshold', () => {
    expect(calculateStockStatus(1, 10)).toBe(StockStatus.LOW_STOCK);
    expect(calculateStockStatus(5, 10)).toBe(StockStatus.LOW_STOCK);
    expect(calculateStockStatus(10, 10)).toBe(StockStatus.LOW_STOCK);
  });

  it('should return IN_STOCK when quantity exceeds the threshold', () => {
    expect(calculateStockStatus(11, 10)).toBe(StockStatus.IN_STOCK);
    expect(calculateStockStatus(100, 10)).toBe(StockStatus.IN_STOCK);
  });

  it('should respect custom low stock thresholds', () => {
    expect(calculateStockStatus(15, 20)).toBe(StockStatus.LOW_STOCK);
    expect(calculateStockStatus(21, 20)).toBe(StockStatus.IN_STOCK);
    expect(calculateStockStatus(3, 2)).toBe(StockStatus.IN_STOCK);
    expect(calculateStockStatus(2, 2)).toBe(StockStatus.LOW_STOCK);
  });
});
