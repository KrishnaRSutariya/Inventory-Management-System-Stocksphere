import { Types } from 'mongoose';
import { ProductModel } from '../products/product.model';
import { InventoryTransactionModel } from './transaction.model';
import { AdjustStockInput, InventoryLogQueryFilters } from './inventory.types';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';
import { InventoryTransactionType } from '../../common/constants/stockStatus';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';

export class InventoryService {
  public async adjustStock(input: AdjustStockInput) {
    if (!Types.ObjectId.isValid(input.productId)) {
      throw new BadRequestError(`Invalid product ID format: ${input.productId}`);
    }

    const product = await ProductModel.findById(input.productId);
    if (!product) {
      throw new NotFoundError(`Product with ID '${input.productId}' not found`);
    }

    const previousQuantity = product.quantity;
    let newQuantity = previousQuantity;

    if (input.type === InventoryTransactionType.IN) {
      newQuantity = previousQuantity + input.quantity;
    } else if (input.type === InventoryTransactionType.OUT) {
      if (previousQuantity < input.quantity) {
        throw new BadRequestError(
          `Insufficient stock for '${product.name}'. Current available stock: ${previousQuantity}, requested reduction: ${input.quantity}. Cannot result in negative inventory.`
        );
      }
      newQuantity = previousQuantity - input.quantity;
    }

    // Atomic update of product quantity
    product.quantity = newQuantity;
    await product.save();

    // Create immutable audit ledger record
    const transaction = await InventoryTransactionModel.create({
      product: product._id,
      type: input.type,
      quantity: input.quantity,
      previousQuantity,
      newQuantity,
      note: input.note || (input.type === InventoryTransactionType.IN ? 'Stock Inward' : 'Stock Outward'),
      createdBy: new Types.ObjectId(input.userId)
    });

    const populatedTransaction = await InventoryTransactionModel.findById(transaction._id)
      .populate('createdBy', 'name email')
      .populate('product', 'name sku unitPrice');

    const updatedProduct = await ProductModel.findById(product._id)
      .populate('category', 'name')
      .populate('createdBy', 'name email');

    return {
      product: updatedProduct,
      transaction: populatedTransaction
    };
  }

  public async getProductHistory(productId: string, pageQuery = 1, limitQuery = 10) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestError(`Invalid product ID format: ${productId}`);
    }

    const { page, limit, skip } = parsePagination({ page: pageQuery, limit: limitQuery });

    const filter = { product: new Types.ObjectId(productId) };

    const [transactions, total] = await Promise.all([
      InventoryTransactionModel.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      InventoryTransactionModel.countDocuments(filter)
    ]);

    return {
      transactions,
      pagination: buildPaginationMeta(total, page, limit)
    };
  }

  public async getAllTransactions(filters: InventoryLogQueryFilters) {
    const { page, limit, skip } = parsePagination(filters);
    const query: any = {};

    if (filters.productId && Types.ObjectId.isValid(filters.productId)) {
      query.product = new Types.ObjectId(filters.productId);
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const [transactions, total] = await Promise.all([
      InventoryTransactionModel.find(query)
        .populate('product', 'name sku unitPrice lowStockThreshold')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      InventoryTransactionModel.countDocuments(query)
    ]);

    return {
      transactions,
      pagination: buildPaginationMeta(total, page, limit)
    };
  }
}

export const inventoryService = new InventoryService();
