import { Document, Types } from 'mongoose';
import { InventoryTransactionType } from '../../common/constants/stockStatus';

export interface IInventoryTransaction extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  type: InventoryTransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdjustStockInput {
  productId: string;
  type: InventoryTransactionType;
  quantity: number;
  note?: string;
  userId: string;
}

export interface InventoryLogQueryFilters {
  page?: number | string;
  limit?: number | string;
  productId?: string;
  type?: InventoryTransactionType;
  startDate?: string;
  endDate?: string;
}
