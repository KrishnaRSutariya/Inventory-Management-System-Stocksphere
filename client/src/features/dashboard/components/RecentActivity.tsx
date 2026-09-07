import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ArrowDownLeft, ArrowUpRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InventoryTransaction, InventoryTransactionType } from '../../../types/api.types';
import { formatDateTime } from '../../../lib/utils';

export interface RecentActivityProps {
  transactions: InventoryTransaction[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ transactions }) => {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Stock Movements
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time audit log of inward & outward inventory transactions
          </p>
        </div>
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <span>View Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No stock movements recorded yet
          </div>
        ) : (
          transactions.map((tx) => {
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
              <div
                key={tx._id}
                className="py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncoming
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                    }`}
                  >
                    {isIncoming ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {productName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span className="font-mono">{productSku}</span>
                      <span>•</span>
                      <span>by {tx.createdBy?.name || 'System'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className={`text-xs font-bold ${
                        isIncoming
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncoming ? '+' : '-'}
                      {tx.quantity} units
                    </span>
                    <Badge
                      variant={isIncoming ? 'success' : 'danger'}
                      className="text-[10px] py-0 px-1.5"
                    >
                      {tx.type}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatDateTime(tx.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
