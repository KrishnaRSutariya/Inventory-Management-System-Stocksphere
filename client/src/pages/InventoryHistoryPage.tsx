import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllTransactions } from '../features/inventory/api/inventory.api';
import { TransactionHistoryTable } from '../features/inventory/components/TransactionHistoryTable';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { InventoryTransactionType } from '../types/api.types';
import { History, ArrowDownLeft, ArrowUpRight, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const InventoryHistoryPage: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<InventoryTransactionType | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);

  const {
    data: historyData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['inventory-history', { page, limit, type: typeFilter, startDate, endDate }],
    queryFn: () =>
      fetchAllTransactions({
        page,
        limit,
        type: typeFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      })
  });

  const handleReset = () => {
    setTypeFilter(undefined);
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasFilters = Boolean(typeFilter || startDate || endDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Stock Movement Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete audit trail of all warehouse shipments, client dispatches, and inventory adjustments
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Type pills */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTypeFilter(undefined);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === undefined
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            All Movements
          </button>

          <button
            type="button"
            onClick={() => {
              setTypeFilter(InventoryTransactionType.IN);
              setPage(1);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === InventoryTransactionType.IN
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Stock In (Receipts)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTypeFilter(InventoryTransactionType.OUT);
              setPage(1);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === InventoryTransactionType.OUT
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Stock Out (Dispatches)</span>
          </button>
        </div>

        {/* Date pickers & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-slate-500"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table & Pagination */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : isError || !historyData ? (
        <ErrorState onRetry={() => refetch()} />
      ) : historyData.transactions.length === 0 ? (
        <EmptyState
          title="No stock movements found"
          description={
            hasFilters
              ? 'No transaction logs match the selected filter range.'
              : 'Transactions will appear here whenever products are adjusted or created.'
          }
          icon={<History className="w-7 h-7" />}
          actionLabel={hasFilters ? 'Reset Filters' : undefined}
          onAction={hasFilters ? handleReset : undefined}
        />
      ) : (
        <div className="space-y-4">
          <TransactionHistoryTable transactions={historyData.transactions} />

          <Pagination
            meta={historyData.pagination}
            onPageChange={(newPage) => setPage(newPage)}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
