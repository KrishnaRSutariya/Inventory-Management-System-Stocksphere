import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../features/categories/api/categories.api';
import { CategoryTable } from '../features/categories/components/CategoryTable';
import { CategoryFormModal } from '../features/categories/components/CategoryFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Category } from '../types/api.types';
import { CategoryFormValues } from '../features/categories/schemas/category.schema';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Plus, FolderTree, Search } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);

  // Fetch Categories
  const {
    data: categories = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Category created successfully');
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormValues }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Category updated successfully');
      setIsFormOpen(false);
      setEditingCategory(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Category deleted');
      setDeleteCandidate(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  });

  const handleFormSubmit = async (data: CategoryFormValues) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({ id: editingCategory._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (cat: Category) => {
    if ((cat.productCount || 0) > 0) {
      toast.error(
        `Cannot delete '${cat.name}' because it has ${cat.productCount} assigned products. Please reassign them first.`
      );
      return;
    }
    setDeleteCandidate(cat);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Category Classifications
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize inventory items into structured departments and segments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingCategory(null);
              setIsFormOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Category
          </Button>
        </div>
      </div>

      {/* Filter / Search bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Total Categories: <strong className="text-slate-700 dark:text-slate-200">{categories.length}</strong>
        </span>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description={
            search
              ? 'No categories match your search term.'
              : 'Create your first category to start organizing products.'
          }
          icon={<FolderTree className="w-7 h-7" />}
          actionLabel={search ? 'Clear Search' : 'Add Category'}
          onAction={
            search
              ? () => setSearch('')
              : () => {
                  setEditingCategory(null);
                  setIsFormOpen(true);
                }
          }
        />
      ) : (
        <CategoryTable
          categories={filteredCategories}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      {/* Category Create/Edit Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleFormSubmit}
        category={editingCategory}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Alert */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={() => deleteCandidate && deleteMutation.mutateAsync(deleteCandidate._id)}
        title={`Delete Category '${deleteCandidate?.name}'?`}
        message="Are you sure you want to remove this category? This action is permanent and cannot be undone."
        confirmLabel="Delete Category"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
