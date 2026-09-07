import { ProductModel } from '../products/product.model';
import { CategoryModel } from '../categories/category.model';
import { InventoryTransactionModel } from '../inventory/transaction.model';
import { stockStatusAggregationExpr } from '../../common/utils/stockStatus';
import { StockStatus } from '../../common/constants/stockStatus';

export class DashboardService {
  public async getDashboardMetrics() {
    const [
      totalCategories,
      productAggregations,
      categoryDistribution,
      recentTransactions
    ] = await Promise.all([
      // 1. Total Categories
      CategoryModel.countDocuments(),

      // 2. Product KPIs via Aggregation Pipeline
      ProductModel.aggregate([
        {
          $addFields: {
            computedStatus: stockStatusAggregationExpr,
            itemValue: { $multiply: ['$quantity', '$unitPrice'] }
          }
        },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStockQuantity: { $sum: '$quantity' },
            totalInventoryValue: { $sum: '$itemValue' },
            outOfStockItems: {
              $sum: {
                $cond: [{ $eq: ['$computedStatus', StockStatus.OUT_OF_STOCK] }, 1, 0]
              }
            },
            lowStockItems: {
              $sum: {
                $cond: [{ $eq: ['$computedStatus', StockStatus.LOW_STOCK] }, 1, 0]
              }
            },
            inStockItems: {
              $sum: {
                $cond: [{ $eq: ['$computedStatus', StockStatus.IN_STOCK] }, 1, 0]
              }
            }
          }
        }
      ]),

      // 3. Category Distribution for Charts
      ProductModel.aggregate([
        {
          $group: {
            _id: '$category',
            productCount: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryInfo'
          }
        },
        { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            categoryName: { $ifNull: ['$categoryInfo.name', 'Unassigned'] },
            productCount: 1,
            totalQuantity: 1,
            totalValue: { $round: ['$totalValue', 2] }
          }
        },
        { $sort: { totalQuantity: -1 } }
      ]),

      // 4. Recent Inventory Movements
      InventoryTransactionModel.find()
        .populate('product', 'name sku unitPrice')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(8)
    ]);

    const stats = productAggregations[0] || {
      totalProducts: 0,
      totalStockQuantity: 0,
      totalInventoryValue: 0,
      outOfStockItems: 0,
      lowStockItems: 0,
      inStockItems: 0
    };

    return {
      kpis: {
        totalProducts: stats.totalProducts,
        totalCategories,
        totalStockQuantity: stats.totalStockQuantity,
        lowStockItems: stats.lowStockItems,
        outOfStockItems: stats.outOfStockItems,
        inStockItems: stats.inStockItems,
        totalInventoryValue: Math.round(stats.totalInventoryValue * 100) / 100
      },
      statusBreakdown: [
        { name: 'In Stock', count: stats.inStockItems, status: StockStatus.IN_STOCK, color: '#10B981' },
        { name: 'Low Stock', count: stats.lowStockItems, status: StockStatus.LOW_STOCK, color: '#F59E0B' },
        { name: 'Out of Stock', count: stats.outOfStockItems, status: StockStatus.OUT_OF_STOCK, color: '#EF4444' }
      ],
      categoryDistribution,
      recentTransactions
    };
  }
}

export const dashboardService = new DashboardService();
