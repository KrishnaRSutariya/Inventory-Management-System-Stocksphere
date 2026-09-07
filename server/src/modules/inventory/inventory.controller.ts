import { Request, Response } from 'express';
import { inventoryService } from './inventory.service';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class InventoryController {
  public adjust = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { type, quantity, note } = req.body;

    const result = await inventoryService.adjustStock({
      productId,
      type,
      quantity,
      note,
      userId: req.user!._id.toString()
    });

    return ApiResponse.success(res, result, 'Stock level adjusted successfully');
  });

  public getProductHistory = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { page, limit } = req.query;

    const { transactions, pagination } = await inventoryService.getProductHistory(
      productId,
      page ? parseInt(String(page), 10) : 1,
      limit ? parseInt(String(limit), 10) : 10
    );

    return ApiResponse.success(
      res,
      transactions,
      'Product inventory history retrieved',
      200,
      pagination
    );
  });

  public getAllTransactions = asyncHandler(async (req: Request, res: Response) => {
    const { transactions, pagination } = await inventoryService.getAllTransactions(
      req.query as any
    );

    return ApiResponse.success(
      res,
      transactions,
      'Inventory audit transactions retrieved',
      200,
      pagination
    );
  });
}

export const inventoryController = new InventoryController();
