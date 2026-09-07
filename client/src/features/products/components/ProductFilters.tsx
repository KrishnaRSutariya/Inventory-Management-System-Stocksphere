import React from 'react';
import { SearchInput } from '../../../components/common/SearchInput';
import { Category, StockStatus } from '../../../types/api.types';
import { ArrowUpDown, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus?: StockStatus;
  onStatusChange: (value?: StockStatus) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: any, order: 'asc' | 'desc') => void;
  categories: Category[];
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  sortOrder,
  onSortChange,
  categories,
  onReset,
  hasActiveFilters
}) => {
  const statusOptions: Array<{ label: string; value?: StockStatus }> = [
    { label: 'All Status', value: undefined },
    { label: 'In Stock', value: StockStatus.IN_STOCK },
    { label: 'Low Stock', value: StockStatus.LOW_STOCK },
    { label: 'Out of Stock', value: StockStatus.OUT_OF_STOCK }
  ];

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      {/* Search & Category Filter Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            placeholder="Search by product name, SKU, or supplier..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden text-xs">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value, sortOrder)}
              className="bg-transparent px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Product Name</option>
              <option value="quantity">Stock Quantity</option>
              <option value="unitPrice">Unit Price</option>
            </select>
            <button
              type="button"
              onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 py-2 border-l border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Stock Status Pills Row */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto pb-1">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-2 uppercase tracking-wider shrink-0">
          Status:
        </span>
        {statusOptions.map((opt) => {
          const isSelected = selectedStatus === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
