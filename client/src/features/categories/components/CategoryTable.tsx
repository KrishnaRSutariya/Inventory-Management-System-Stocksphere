import React from 'react';
import { Category } from '../../../types/api.types';
import { Badge } from '../../../components/ui/Badge';
import { formatDate } from '../../../lib/utils';
import { Edit2, Trash2, Package } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  onEdit,
  onDelete
}) => {
  const { isAdmin } = useAuth();

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th className="py-3.5 px-4">Category Name</th>
            <th className="py-3.5 px-4">Description</th>
            <th className="py-3.5 px-4 text-center">Assigned Products</th>
            <th className="py-3.5 px-4">Created Date</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {categories.map((cat) => {
            const hasProducts = (cat.productCount || 0) > 0;

            return (
              <tr
                key={cat._id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Name */}
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                  {cat.name}
                </td>

                {/* Description */}
                <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-sm truncate">
                  {cat.description || '—'}
                </td>

                {/* Assigned Products Count */}
                <td className="py-3.5 px-4 text-center">
                  <Badge
                    variant={hasProducts ? 'info' : 'default'}
                    className="gap-1 font-semibold"
                  >
                    <Package className="w-3.5 h-3.5" />
                    {cat.productCount || 0} items
                  </Badge>
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(cat.createdAt)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onDelete(cat)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          hasProducts
                            ? 'text-slate-300 dark:text-slate-600 hover:text-slate-400'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        }`}
                        title={
                          hasProducts
                            ? 'Cannot delete category containing assigned products'
                            : 'Delete Category'
                        }
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
