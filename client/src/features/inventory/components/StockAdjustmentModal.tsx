import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Product, InventoryTransactionType } from '../../../types/api.types';
import { ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';
import { adjustStock } from '../api/inventory.api';
import { toast } from 'sonner';

export interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess
}) => {
  const [type, setType] = useState<InventoryTransactionType>(InventoryTransactionType.IN);
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  if (!product) return null;

  const currentStock = product.quantity;
  const isOut = type === InventoryTransactionType.OUT;
  const projectedStock = isOut ? currentStock - (quantity || 0) : currentStock + (quantity || 0);
  const isInvalid = isOut && projectedStock < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      toast.error('Adjustment quantity must be at least 1 unit');
      return;
    }

    if (isInvalid) {
      toast.error('Cannot reduce stock below zero units');
      return;
    }

    setIsLoading(true);
    try {
      await adjustStock({
        productId: product._id,
        type,
        quantity,
        note: note.trim()
      });

      toast.success(
        `Successfully ${isOut ? 'reduced' : 'added'} ${quantity} unit(s) for ${product.name}`
      );
      setQuantity(1);
      setNote('');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock: ${product.name}`}
      description={`SKU: ${product.sku} | Current Stock: ${currentStock} units`}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isOut ? 'danger' : 'success'}
            size="sm"
            onClick={handleSubmit}
            disabled={isInvalid || !quantity || quantity <= 0}
            isLoading={isLoading}
          >
            Confirm {isOut ? 'Stock Outward' : 'Stock Inward'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: IN vs OUT */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Adjustment Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType(InventoryTransactionType.IN)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                type === InventoryTransactionType.IN
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-600 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>STOCK IN (Add)</span>
            </button>

            <button
              type="button"
              onClick={() => setType(InventoryTransactionType.OUT)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                type === InventoryTransactionType.OUT
                  ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/40 dark:border-rose-600 dark:text-rose-300 ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>STOCK OUT (Reduce)</span>
            </button>
          </div>
        </div>

        {/* Quantity Input */}
        <Input
          label="Quantity to Adjust"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
          required
        />

        {/* Real-time Calculation Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Current Level</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {currentStock} units
            </p>
          </div>

          <div className="text-center">
            <span className="text-slate-400">Delta</span>
            <p
              className={`font-bold text-sm ${
                isOut ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {isOut ? '-' : '+'}
              {quantity || 0}
            </p>
          </div>

          <div className="text-right">
            <span className="text-slate-400">Projected Level</span>
            <p
              className={`font-extrabold text-sm ${
                isInvalid
                  ? 'text-rose-600'
                  : projectedStock <= (product.lowStockThreshold || 10)
                  ? 'text-amber-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {projectedStock} units
            </p>
          </div>
        </div>

        {/* Negative Stock Warning alert */}
        {isInvalid && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Insufficient inventory. Maximum available to dispatch is{' '}
              <strong>{currentStock}</strong> units.
            </span>
          </div>
        )}

        {/* Note / Audit explanation */}
        <Textarea
          label="Adjustment Reason / Note (Optional)"
          placeholder="e.g. Received shipment PO-994, Customer return, Defective damaged unit"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};
