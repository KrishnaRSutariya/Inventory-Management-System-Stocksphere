import React from 'react';
import { Product } from '../../../types/api.types';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { formatCurrency } from '../../../lib/utils';
import {
  ArrowUpDown,
  Barcode,
  Eye,
  Edit2,
  Trash2,
  Layers
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export interface ProductTableProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onViewBarcode: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onViewDetails,
  onEdit,
  onDelete,
  onAdjustStock,
  onViewBarcode
}) => {
  const { isAdmin } = useAuth();

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th className="py-3.5 px-4 min-w-[230px]">Product</th>
            <th className="py-3.5 px-4 min-w-[160px]">SKU</th>
            <th className="py-3.5 px-4 min-w-[160px]">Category</th>
            <th className="py-3.5 px-4 min-w-[140px] text-center">Stock & Status</th>
            <th className="py-3.5 px-4 min-w-[110px] text-right">Unit Price</th>
            <th className="py-3.5 px-4 min-w-[150px] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {products.map((product) => {
            return (
              <tr
                key={product._id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Product Name & Supplier */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <button
                      onClick={() => onViewDetails(product)}
                      className="text-left font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {product.name}
                    </button>
                    <span className="text-xs text-slate-400">
                      Supplier: {product.supplierName}
                    </span>
                  </div>
                </td>

                {/* SKU (prevent wrapping) */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide whitespace-nowrap select-all">
                    {product.sku}
                  </span>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[180px]">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </span>
                </td>

                {/* Stock Quantity & Status */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {product.quantity}{' '}
                      <span className="text-[11px] font-normal text-slate-400">units</span>
                    </span>
                    <StatusBadge
                      status={product.status}
                      quantity={product.quantity}
                      threshold={product.lowStockThreshold}
                    />
                  </div>
                </td>

                {/* Unit Price */}
                <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  {formatCurrency(product.unitPrice)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {/* Adjust Stock */}
                    <button
                      type="button"
                      onClick={() => onAdjustStock(product)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                      title="Adjust Stock Quantity"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>

                    {/* Barcode & QR */}
                    <button
                      type="button"
                      onClick={() => onViewBarcode(product)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                      title="Barcode / QR Label"
                    >
                      <Barcode className="w-4 h-4" />
                    </button>

                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => onViewDetails(product)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Product */}
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Product (Admin only) */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
