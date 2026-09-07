import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class DashboardController {
  public getMetrics = asyncHandler(async (_req: Request, res: Response) => {
    const metrics = await dashboardService.getDashboardMetrics();
    return ApiResponse.success(res, metrics, 'Dashboard metrics retrieved successfully');
  });
}

export const dashboardController = new DashboardController();
