import { Request, Response } from 'express';
import { categoryService } from './category.service';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class CategoryController {
  public getAll = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();
    return ApiResponse.success(res, categories, 'Categories retrieved successfully');
  });

  public getById = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getCategoryById(req.params.id);
    return ApiResponse.success(res, category, 'Category retrieved successfully');
  });

  public create = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.createCategory({
      ...req.body,
      userId: req.user!._id.toString()
    });
    return ApiResponse.created(res, category, 'Category created successfully');
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return ApiResponse.success(res, category, 'Category updated successfully');
  });

  public delete = asyncHandler(async (req: Request, res: Response) => {
    await categoryService.deleteCategory(req.params.id);
    return ApiResponse.success(res, null, 'Category deleted successfully');
  });
}

export const categoryController = new CategoryController();
