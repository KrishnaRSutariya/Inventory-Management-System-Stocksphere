import { Request, Response } from 'express';
import { productService } from './product.service';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { BadRequestError } from '../../common/errors/AppError';

export class ProductController {
  public getAll = asyncHandler(async (req: Request, res: Response) => {
    const { products, pagination } = await productService.getProducts(req.query as any);
    return ApiResponse.success(res, products, 'Products retrieved successfully', 200, pagination);
  });

  public getById = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductById(req.params.id);
    return ApiResponse.success(res, product, 'Product details retrieved successfully');
  });

  public create = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct({
      ...req.body,
      userId: req.user!._id.toString()
    });
    return ApiResponse.created(res, product, 'Product created successfully');
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    return ApiResponse.success(res, product, 'Product updated successfully');
  });

  public delete = asyncHandler(async (req: Request, res: Response) => {
    await productService.deleteProduct(req.params.id);
    return ApiResponse.success(res, null, 'Product deleted successfully');
  });

  public exportCsv = asyncHandler(async (req: Request, res: Response) => {
    const csvData = await productService.exportProductsToCsv(req.query as any);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inventory-products-${Date.now()}.csv"`);
    return res.status(200).send(csvData);
  });

  public importCsv = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError('Please upload a valid CSV file');
    }

    const summary = await productService.importProductsFromCsv(
      req.file.buffer,
      req.user!._id.toString()
    );

    return ApiResponse.success(res, summary, 'CSV import processed');
  });
}

export const productController = new ProductController();
