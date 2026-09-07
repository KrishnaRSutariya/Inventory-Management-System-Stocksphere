import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Product } from '../../../types/api.types';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import {
  Package,
  Layers,
  Building2,
  Calendar,
  Clock,
  ArrowUpDown,
  Barcode
} from 'lucide-react';

export interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onOpenStockAdjust: (product: Product) => void;
  onOpenBarcode: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  onOpenStockAdjust,
  onOpenBarcode
}) => {
  if (!product) return null;

  const totalValue = product.quantity * product.unitPrice;
  const isLowStock = product.quantity <= (product.lowStockThreshold || 10) && product.quantity > 0;
  const isOutOfStock = product.quantity === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      description={`SKU: ${product.sku}`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onOpenBarcode(product);
            }}
            leftIcon={<Barcode className="w-4 h-4" />}
          >
            Barcode / QR
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenStockAdjust(product);
              }}
              leftIcon={<ArrowUpDown className="w-4 h-4" />}
            >
              Adjust Stock
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status and Stock Highlight Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div>
            <span className="text-xs text-slate-400">Current Availability</span>
            <div className="mt-1">
              <StatusBadge
                status={product.status}
                quantity={product.quantity}
                threshold={product.lowStockThreshold}
              />
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Available Stock</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">
              {product.quantity}{' '}
              <span className="text-xs font-normal text-slate-400">units</span>
            </p>
          </div>
        </div>

        {/* Stock Level Indicator bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Threshold: {product.lowStockThreshold || 10} units</span>
            <span>
              {isOutOfStock
                ? 'Out of Stock'
                : isLowStock
                ? 'Low Stock Warning'
                : 'Adequate Reserve'}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOutOfStock
                  ? 'w-0'
                  : isLowStock
                  ? 'bg-amber-500 w-1/4'
                  : 'bg-emerald-500 w-full'
              }`}
            />
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Layers className="w-3.5 h-3.5" /> Category
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
              {product.category?.name || 'Uncategorized'}
            </p>
          </div>

          <div>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Building2 className="w-3.5 h-3.5" /> Supplier
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
              {product.supplierName}
            </p>
          </div>

          <div>
            <span className="text-xs text-slate-400">Unit Price</span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
              {formatCurrency(product.unitPrice)}
            </p>
          </div>

          <div>
            <span className="text-xs text-slate-400">Total Asset Value</span>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(totalValue)}
            </p>
          </div>

          <div>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" /> Date Added
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
              {formatDateTime(product.createdAt)}
            </p>
          </div>

          <div>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" /> Last Updated
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
              {formatDateTime(product.updatedAt)}
            </p>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Description
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
