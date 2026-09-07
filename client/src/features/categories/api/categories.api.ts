import { api } from '../../../lib/axios';
import { ApiResponse, Category } from '../../../types/api.types';
import { CategoryFormValues } from '../schemas/category.schema';

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get<ApiResponse<Category[]>>('/categories');
  return res.data.data;
};

export const fetchCategoryById = async (id: string): Promise<Category> => {
  const res = await api.get<ApiResponse<Category>>(`/categories/${id}`);
  return res.data.data;
};

export const createCategory = async (data: CategoryFormValues): Promise<Category> => {
  const res = await api.post<ApiResponse<Category>>('/categories', data);
  return res.data.data;
};

export const updateCategory = async (id: string, data: CategoryFormValues): Promise<Category> => {
  const res = await api.patch<ApiResponse<Category>>(`/categories/${id}`, data);
  return res.data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
