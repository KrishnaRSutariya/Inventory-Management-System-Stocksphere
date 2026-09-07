export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: Array<{ field?: string; message: string }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export enum InventoryTransactionType {
  IN = 'IN',
  OUT = 'OUT'
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  productCount?: number;
  createdBy: string | { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: {
    _id: string;
    name: string;
    description?: string;
  };
  description?: string;
  quantity: number;
  unitPrice: number;
  supplierName: string;
  lowStockThreshold: number;
  barcode?: string;
  status: StockStatus;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku: string;
    unitPrice?: number;
  } | string;
  type: InventoryTransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface DashboardMetrics {
  kpis: {
    totalProducts: number;
    totalCategories: number;
    totalStockQuantity: number;
    lowStockItems: number;
    outOfStockItems: number;
    inStockItems: number;
    totalInventoryValue: number;
  };
  statusBreakdown: Array<{
    name: string;
    count: number;
    status: StockStatus;
    color: string;
  }>;
  categoryDistribution: Array<{
    _id: string;
    categoryName: string;
    productCount: number;
    totalQuantity: number;
    totalValue: number;
  }>;
  recentTransactions: InventoryTransaction[];
}
