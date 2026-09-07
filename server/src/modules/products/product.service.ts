import { Types } from 'mongoose';
import { ProductModel } from './product.model';
import { CategoryModel } from '../categories/category.model';
import { InventoryTransactionModel } from '../inventory/transaction.model';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryFilters,
  IProduct
} from './product.types';
import {
  NotFoundError,
  ConflictError,
  BadRequestError
} from '../../common/errors/AppError';
import { StockStatus, InventoryTransactionType } from '../../common/constants/stockStatus';
import { calculateStockStatus } from '../../common/utils/stockStatus';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { Parser } from 'json2csv';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

export class ProductService {
  public async getProducts(filters: ProductQueryFilters) {
    const { page, limit, skip } = parsePagination(filters);
    const query: any = {};

    // 1. Search Filter (by Product Name, SKU, or Supplier Name)
    if (filters.search && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { supplierName: searchRegex }
      ];
    }

    // 2. Category Filter
    if (filters.category && Types.ObjectId.isValid(filters.category)) {
      query.category = new Types.ObjectId(filters.category);
    }

    // 3. Dynamic Stock Status Filter
    if (filters.status) {
      if (filters.status === StockStatus.OUT_OF_STOCK) {
        query.quantity = { $lte: 0 };
      } else if (filters.status === StockStatus.LOW_STOCK) {
        query.quantity = { $gt: 0 };
        query.$expr = {
          $lte: [
            '$quantity',
            { $ifNull: ['$lowStockThreshold', 10] }
          ]
        };
      } else if (filters.status === StockStatus.IN_STOCK) {
        query.$expr = {
          $gt: [
            '$quantity',
            { $ifNull: ['$lowStockThreshold', 10] }
          ]
        };
      }
    }

    // 4. Sorting
    const sortField = filters.sortBy || 'createdAt';
    const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortField]: sortDirection };

    // Execute queries
    const [products, total] = await Promise.all([
      ProductModel.find(query)
        .populate('category', 'name _id')
        .populate('createdBy', 'name email _id')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(query)
    ]);

    const formattedProducts = products.map((p: any) => ({
      ...p,
      status: calculateStockStatus(p.quantity, p.lowStockThreshold)
    }));

    const pagination = buildPaginationMeta(total, page, limit);

    return {
      products: formattedProducts,
      pagination
    };
  }

  public async getProductById(id: string): Promise<IProduct> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid product ID format: ${id}`);
    }

    const product = await ProductModel.findById(id)
      .populate('category', 'name _id description')
      .populate('createdBy', 'name email _id');

    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    const obj: any = product.toObject();
    obj.status = calculateStockStatus(product.quantity, product.lowStockThreshold);

    return obj;
  }

  public async createProduct(input: CreateProductInput): Promise<IProduct> {
    const formattedSku = input.sku.trim().toUpperCase();

    // 1. Verify unique SKU
    const existingSku = await ProductModel.findOne({ sku: formattedSku });
    if (existingSku) {
      throw new ConflictError(`A product with SKU '${formattedSku}' already exists`);
    }

    // 2. Verify Category exists
    const category = await CategoryModel.findById(input.category);
    if (!category) {
      throw new NotFoundError(`Category with ID '${input.category}' not found`);
    }

    // 3. Create Product
    const product = await ProductModel.create({
      name: input.name.trim(),
      sku: formattedSku,
      category: new Types.ObjectId(input.category),
      description: input.description?.trim(),
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      supplierName: input.supplierName.trim(),
      lowStockThreshold: input.lowStockThreshold || 10,
      barcode: input.barcode?.trim() || formattedSku,
      createdBy: new Types.ObjectId(input.userId)
    });

    // 4. Log initial stock transaction if initial quantity > 0
    if (input.quantity > 0) {
      await InventoryTransactionModel.create({
        product: product._id,
        type: InventoryTransactionType.IN,
        quantity: input.quantity,
        previousQuantity: 0,
        newQuantity: input.quantity,
        note: 'Initial stock on product creation',
        createdBy: new Types.ObjectId(input.userId)
      });
    }

    const populated = await ProductModel.findById(product._id)
      .populate('category', 'name _id')
      .populate('createdBy', 'name email _id');

    const obj: any = populated!.toObject();
    obj.status = calculateStockStatus(populated!.quantity, populated!.lowStockThreshold);

    return obj;
  }

  public async updateProduct(id: string, input: UpdateProductInput): Promise<IProduct> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid product ID format: ${id}`);
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    // If SKU changed, ensure uniqueness
    if (input.sku) {
      const formattedSku = input.sku.trim().toUpperCase();
      if (formattedSku !== product.sku) {
        const existing = await ProductModel.findOne({
          sku: formattedSku,
          _id: { $ne: id }
        });
        if (existing) {
          throw new ConflictError(`A product with SKU '${formattedSku}' already exists`);
        }
        product.sku = formattedSku;
      }
    }

    // If category changed, ensure validity
    if (input.category) {
      const category = await CategoryModel.findById(input.category);
      if (!category) {
        throw new NotFoundError(`Category with ID '${input.category}' not found`);
      }
      product.category = new Types.ObjectId(input.category);
    }

    if (input.name !== undefined) product.name = input.name.trim();
    if (input.description !== undefined) product.description = input.description.trim();
    if (input.unitPrice !== undefined) product.unitPrice = input.unitPrice;
    if (input.supplierName !== undefined) product.supplierName = input.supplierName.trim();
    if (input.lowStockThreshold !== undefined) product.lowStockThreshold = input.lowStockThreshold;
    if (input.barcode !== undefined) product.barcode = input.barcode.trim();

    // If quantity changed directly in update form, we adjust and record an audit log
    if (input.quantity !== undefined && input.quantity !== product.quantity) {
      const prevQty = product.quantity;
      const newQty = input.quantity;
      const diff = newQty - prevQty;
      product.quantity = newQty;

      await InventoryTransactionModel.create({
        product: product._id,
        type: diff > 0 ? InventoryTransactionType.IN : InventoryTransactionType.OUT,
        quantity: Math.abs(diff),
        previousQuantity: prevQty,
        newQuantity: newQty,
        note: 'Manual quantity update via product edit',
        createdBy: product.createdBy
      });
    }

    await product.save();

    const populated = await ProductModel.findById(product._id)
      .populate('category', 'name _id')
      .populate('createdBy', 'name email _id');

    const obj: any = populated!.toObject();
    obj.status = calculateStockStatus(populated!.quantity, populated!.lowStockThreshold);

    return obj;
  }

  public async deleteProduct(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid product ID format: ${id}`);
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    // Delete associated inventory transaction history
    await InventoryTransactionModel.deleteMany({ product: id });
    await ProductModel.findByIdAndDelete(id);
  }

  public async exportProductsToCsv(filters: ProductQueryFilters): Promise<string> {
    // Fetch all matching products without pagination limit
    const query: any = {};
    if (filters.search && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { supplierName: searchRegex }
      ];
    }
    if (filters.category && Types.ObjectId.isValid(filters.category)) {
      query.category = new Types.ObjectId(filters.category);
    }

    const products = await ProductModel.find(query)
      .populate('category', 'name')
      .sort({ name: 1 })
      .lean({ virtuals: true });

    const fields = [
      { label: 'Product Name', value: 'name' },
      { label: 'SKU', value: 'sku' },
      { label: 'Category', value: (row: any) => row.category?.name || 'Uncategorized' },
      { label: 'Quantity', value: 'quantity' },
      { label: 'Unit Price', value: 'unitPrice' },
      { label: 'Stock Status', value: 'status' },
      { label: 'Supplier', value: 'supplierName' },
      { label: 'Low Stock Threshold', value: 'lowStockThreshold' },
      { label: 'Description', value: 'description' },
      { label: 'Barcode', value: 'barcode' },
      { label: 'Date Added', value: (row: any) => new Date(row.createdAt).toISOString() }
    ];

    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(products);
  }

  public async importProductsFromCsv(fileBuffer: Buffer, userId: string) {
    const results: any[] = [];
    const errors: Array<{ row: number; reason: string }> = [];
    let successCount = 0;

    const stream = Readable.from(fileBuffer).pipe(csvParser());

    for await (const row of stream) {
      results.push(row);
    }

    // Cache categories to avoid repetitive queries
    const allCategories = await CategoryModel.find();
    const categoryMap = new Map<string, Types.ObjectId>();
    allCategories.forEach((cat) => {
      categoryMap.set(cat.name.trim().toLowerCase(), cat._id);
    });

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const rowNum = i + 1;

      const name = row['Product Name'] || row['name'];
      const sku = (row['SKU'] || row['sku'] || '').toUpperCase().trim();
      const categoryName = (row['Category'] || row['category'] || '').trim().toLowerCase();
      const quantity = parseInt(row['Quantity'] || row['quantity'] || '0', 10);
      const unitPrice = parseFloat(row['Unit Price'] || row['unitPrice'] || '0');
      const supplierName = (row['Supplier'] || row['supplierName'] || row['Supplier Name'] || 'Default Supplier').trim();
      const description = row['Description'] || row['description'] || '';

      if (!name || !sku) {
        errors.push({ row: rowNum, reason: 'Product Name and SKU are required' });
        continue;
      }

      if (isNaN(quantity) || quantity < 0) {
        errors.push({ row: rowNum, reason: 'Quantity must be a valid non-negative integer' });
        continue;
      }

      if (isNaN(unitPrice) || unitPrice <= 0) {
        errors.push({ row: rowNum, reason: 'Unit price must be greater than zero' });
        continue;
      }

      // Resolve category
      let categoryId = categoryMap.get(categoryName);
      if (!categoryId) {
        // Auto-create category if missing
        const newCat = await CategoryModel.create({
          name: row['Category'] || row['category'] || 'General',
          createdBy: new Types.ObjectId(userId)
        });
        categoryId = newCat._id;
        categoryMap.set(newCat.name.trim().toLowerCase(), newCat._id);
      }

      try {
        const existing = await ProductModel.findOne({ sku });
        if (existing) {
          existing.name = name;
          existing.category = categoryId;
          existing.quantity = quantity;
          existing.unitPrice = unitPrice;
          existing.supplierName = supplierName;
          existing.description = description;
          await existing.save();
        } else {
          await ProductModel.create({
            name,
            sku,
            category: categoryId,
            quantity,
            unitPrice,
            supplierName,
            description,
            barcode: sku,
            createdBy: new Types.ObjectId(userId)
          });
        }
        successCount++;
      } catch (err: any) {
        errors.push({ row: rowNum, reason: err.message });
      }
    }

    return {
      totalProcessed: results.length,
      successCount,
      failureCount: errors.length,
      errors
    };
  }
}

export const productService = new ProductService();
