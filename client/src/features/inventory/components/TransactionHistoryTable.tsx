import React from 'react';
import { InventoryTransaction, InventoryTransactionType } from '../../../types/api.types';
import { Badge } from '../../../components/ui/Badge';
import { formatDateTime } from '../../../lib/utils';
import { ArrowDownLeft, ArrowUpRight, User } from 'lucide-react';

export interface TransactionHistoryTableProps {
  transactions: InventoryTransaction[];
}

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  transactions
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th className="py-3.5 px-4">Date & Time</th>
            <th className="py-3.5 px-4">Item & SKU</th>
            <th className="py-3.5 px-4 text-center">Type</th>
            <th className="py-3.5 px-4 text-center">Quantity Delta</th>
            <th className="py-3.5 px-4 text-center">Audit Balance (Before → After)</th>
            <th className="py-3.5 px-4">User</th>
            <th className="py-3.5 px-4">Note / Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {transactions.map((tx) => {
            const isIncoming = tx.type === InventoryTransactionType.IN;
            const productName =
              typeof tx.product === 'object' && tx.product !== null
                ? tx.product.name
                : 'Inventory Item';
            const productSku =
              typeof tx.product === 'object' && tx.product !== null
                ? tx.product.sku
                : '—';

            return (
              <tr
                key={tx._id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Date */}
                <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {formatDateTime(tx.createdAt)}
                </td>

                {/* Product */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {productName}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{productSku}</span>
                  </div>
                </td>

                {/* Type */}
                <td className="py-3.5 px-4 text-center">
                  <Badge
                    variant={isIncoming ? 'success' : 'danger'}
                    className="gap-1 font-bold text-xs"
                  >
                    {isIncoming ? (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                    {tx.type}
                  </Badge>
                </td>

                {/* Quantity */}
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`font-bold text-sm ${
                      isIncoming
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncoming ? '+' : '-'}
                    {tx.quantity}
                  </span>
                </td>

                {/* Audit Balance */}
                <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">{tx.previousQuantity}</span>
                  <span className="mx-1 text-slate-400">→</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {tx.newQuantity}
                  </span>
                </td>

                {/* User */}
                <td className="py-3.5 px-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tx.createdBy?.name || 'System'}</span>
                  </div>
                </td>

                {/* Note */}
                <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                  {tx.note || '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
