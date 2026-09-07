import { api } from '../../../lib/axios';
import { ApiResponse, Product, StockStatus } from '../../../types/api.types';
import { ProductFormValues } from '../schemas/product.schema';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: StockStatus;
  sortBy?: 'name' | 'quantity' | 'unitPrice' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const fetchProducts = async (filters: ProductFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const res = await api.get<ApiResponse<Product[]>>(`/products?${params.toString()}`);
  return {
    products: res.data.data,
    pagination: res.data.pagination!
  };
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return res.data.data;
};

export const createProduct = async (data: ProductFormValues): Promise<Product> => {
  const res = await api.post<ApiResponse<Product>>('/products', data);
  return res.data.data;
};

export const updateProduct = async (id: string, data: Partial<ProductFormValues>): Promise<Product> => {
  const res = await api.patch<ApiResponse<Product>>(`/products/${id}`, data);
  return res.data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const exportProductsCsv = async (filters: ProductFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);

  const res = await api.get(`/products/export/csv?${params.toString()}`, {
    responseType: 'blob'
  });

  const blob = new Blob([res.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const importProductsCsv = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post<ApiResponse<{
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    errors: Array<{ row: number; reason: string }>;
  }>>('/products/import/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return res.data.data;
};
