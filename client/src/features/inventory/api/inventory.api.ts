import { api } from '../../../lib/axios';
import {
  ApiResponse,
  InventoryTransaction,
  InventoryTransactionType,
  Product
} from '../../../types/api.types';

export interface AdjustStockPayload {
  productId: string;
  type: InventoryTransactionType;
  quantity: number;
  note?: string;
}

export const adjustStock = async (payload: AdjustStockPayload): Promise<{
  product: Product;
  transaction: InventoryTransaction;
}> => {
  const res = await api.post<ApiResponse<{
    product: Product;
    transaction: InventoryTransaction;
  }>>(`/inventory/${payload.productId}/adjust`, {
    type: payload.type,
    quantity: payload.quantity,
    note: payload.note
  });
  return res.data.data;
};

export const fetchProductHistory = async (productId: string, page = 1, limit = 10) => {
  const res = await api.get<ApiResponse<InventoryTransaction[]>>(
    `/inventory/${productId}/history?page=${page}&limit=${limit}`
  );
  return {
    transactions: res.data.data,
    pagination: res.data.pagination!
  };
};

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: InventoryTransactionType;
  startDate?: string;
  endDate?: string;
}

export const fetchAllTransactions = async (filters: TransactionFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.type) params.append('type', filters.type);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const res = await api.get<ApiResponse<InventoryTransaction[]>>(
    `/inventory/transactions?${params.toString()}`
  );
  return {
    transactions: res.data.data,
    pagination: res.data.pagination!
  };
};
