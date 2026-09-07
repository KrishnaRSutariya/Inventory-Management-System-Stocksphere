import { StockStatus } from '../constants/stockStatus';
import { env } from '../../config/env';

/**
 * Dynamically computes stock status based on current quantity and threshold.
 * Status is never statically persisted in the DB to avoid desynchronization anomalies.
 */
export const calculateStockStatus = (
  quantity: number,
  lowStockThreshold: number = env.DEFAULT_LOW_STOCK_THRESHOLD
): StockStatus => {
  if (quantity <= 0) {
    return StockStatus.OUT_OF_STOCK;
  }
  if (quantity <= lowStockThreshold) {
    return StockStatus.LOW_STOCK;
  }
  return StockStatus.IN_STOCK;
};

/**
 * MongoDB Aggregation Pipeline expression for status computation
 */
export const stockStatusAggregationExpr = {
  $switch: {
    branches: [
      {
        case: { $lte: ['$quantity', 0] },
        then: StockStatus.OUT_OF_STOCK
      },
      {
        case: {
          $lte: [
            '$quantity',
            { $ifNull: ['$lowStockThreshold', env.DEFAULT_LOW_STOCK_THRESHOLD] }
          ]
        },
        then: StockStatus.LOW_STOCK
      }
    ],
    default: StockStatus.IN_STOCK
  }
};
