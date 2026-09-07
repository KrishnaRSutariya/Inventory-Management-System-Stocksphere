import { api } from '../../../lib/axios';
import { ApiResponse, DashboardMetrics } from '../../../types/api.types';

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await api.get<ApiResponse<DashboardMetrics>>('/dashboard');
  return response.data.data;
};
