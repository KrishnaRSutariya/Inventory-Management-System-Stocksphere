export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export const STOCK_STATUSES = [
  StockStatus.IN_STOCK,
  StockStatus.LOW_STOCK,
  StockStatus.OUT_OF_STOCK
] as const;

export enum InventoryTransactionType {
  IN = 'IN',
  OUT = 'OUT'
}
