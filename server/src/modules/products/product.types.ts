import { Document, Types } from 'mongoose';
import { StockStatus } from '../../common/constants/stockStatus';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  sku: string;
  category: Types.ObjectId;
  description?: string;
  quantity: number;
  unitPrice: number;
  supplierName: string;
  lowStockThreshold: number;
  barcode?: string;
  createdBy: Types.ObjectId;
  status?: StockStatus; // Computed dynamically
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  supplierName: string;
  lowStockThreshold?: number;
  barcode?: string;
  userId: string;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  category?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  supplierName?: string;
  lowStockThreshold?: number;
  barcode?: string;
}

export interface ProductQueryFilters {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category?: string;
  status?: StockStatus;
  sortBy?: 'name' | 'quantity' | 'unitPrice' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
