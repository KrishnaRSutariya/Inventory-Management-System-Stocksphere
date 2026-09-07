import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  exportProductsCsv
} from '../features/products/api/products.api';
import { fetchCategories } from '../features/categories/api/categories.api';
import { ProductTable } from '../features/products/components/ProductTable';
import { ProductFilters } from '../features/products/components/ProductFilters';
import { ProductFormModal } from '../features/products/components/ProductFormModal';
import { ProductDetailsModal } from '../features/products/components/ProductDetailsModal';
import { BarcodeModal } from '../features/products/components/BarcodeModal';
import { CSVImportModal } from '../features/products/components/CSVImportModal';
import { StockAdjustmentModal } from '../features/inventory/components/StockAdjustmentModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Product, StockStatus } from '../types/api.types';
import { ProductFormValues } from '../features/products/schemas/product.schema';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Plus, Download, Upload, Package } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State synchronized with URL
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') || '');
  const [statusFilter, setStatusFilter] = useState<StockStatus | undefined>(
    (searchParams.get('status') as StockStatus) || undefined
  );
  const [sortBy, setSortBy] = useState<any>(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState<number>(Number(searchParams.get('limit')) || 10);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [adjustStockProduct, setAdjustStockProduct] = useState<Product | null>(null);

  const [deleteProductCandidate, setDeleteProductCandidate] = useState<Product | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Sync state to URL Query Parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (categoryFilter) params.set('category', categoryFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (page > 1) params.set('page', page.toString());
    if (limit !== 10) params.set('limit', limit.toString());

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, categoryFilter, statusFilter, sortBy, sortOrder, page, limit, setSearchParams]);

  // Check if open action=new passed in query
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsFormOpen(true);
    }
  }, [searchParams]);

  // Fetch Categories for dropdowns
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Fetch Products via TanStack Query
  const {
    data: productData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: [
      'products',
      {
        page,
        limit,
        search: debouncedSearch,
        category: categoryFilter,
        status: statusFilter,
        sortBy,
        sortOrder
      }
    ],
    queryFn: () =>
      fetchProducts({
        page,
        limit,
        search: debouncedSearch,
        category: categoryFilter,
        status: statusFilter,
        sortBy,
        sortOrder
      })
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Product created successfully');
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create product');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormValues> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Product updated successfully');
      setIsFormOpen(false);
      setEditingProduct(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Product removed from inventory');
      setDeleteProductCandidate(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  });

  // Action handlers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: ProductFormValues) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteProductCandidate) {
      await deleteMutation.mutateAsync(deleteProductCandidate._id);
    }
  };

  const handleExportCsv = async () => {
    try {
      toast.loading('Generating CSV export...', { id: 'csv-export' });
      await exportProductsCsv({
        search: debouncedSearch,
        category: categoryFilter,
        status: statusFilter
      });
      toast.success('CSV downloaded successfully', { id: 'csv-export' });
    } catch (_err) {
      toast.error('Failed to export CSV', { id: 'csv-export' });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter(undefined);
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm || categoryFilter || statusFilter || sortBy !== 'createdAt' || sortOrder !== 'desc'
  );

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Product Inventory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage catalog items, monitor real-time stock statuses, and download reports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* CSV Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>

          {/* CSV Bulk Import (Admin) */}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Import CSV
            </Button>
          )}

          {/* Add Product Button */}
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Filter Component */}
      <ProductFilters
        search={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        selectedCategory={categoryFilter}
        onCategoryChange={(val) => {
          setCategoryFilter(val);
          setPage(1);
        }}
        selectedStatus={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(f, o) => {
          setSortBy(f);
          setSortOrder(o);
        }}
        categories={categories}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Product Content / Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : isError || !productData ? (
        <ErrorState onRetry={() => refetch()} />
      ) : productData.products.length === 0 ? (
        <EmptyState
          title="No products match your criteria"
          description={
            hasActiveFilters
              ? 'Try modifying your filters or clearing search terms to locate products.'
              : 'Your inventory catalog is currently empty. Start by adding your first product.'
          }
          icon={<Package className="w-7 h-7" />}
          actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add First Product'}
          onAction={hasActiveFilters ? handleResetFilters : handleOpenCreate}
        />
      ) : (
        <div className="space-y-4">
          <ProductTable
            products={productData.products}
            onViewDetails={(prod) => setDetailsProduct(prod)}
            onEdit={handleOpenEdit}
            onDelete={(prod) => setDeleteProductCandidate(prod)}
            onAdjustStock={(prod) => setAdjustStockProduct(prod)}
            onViewBarcode={(prod) => setBarcodeProduct(prod)}
          />

          <Pagination
            meta={productData.pagination}
            onPageChange={(newPage) => setPage(newPage)}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Product Create / Edit Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        categories={categories}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Product Detailed Inspection Modal */}
      <ProductDetailsModal
        isOpen={!!detailsProduct}
        onClose={() => setDetailsProduct(null)}
        product={detailsProduct}
        onOpenStockAdjust={(prod) => setAdjustStockProduct(prod)}
        onOpenBarcode={(prod) => setBarcodeProduct(prod)}
      />

      {/* Barcode & QR Modal */}
      <BarcodeModal
        isOpen={!!barcodeProduct}
        onClose={() => setBarcodeProduct(null)}
        product={barcodeProduct}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={!!adjustStockProduct}
        onClose={() => setAdjustStockProduct(null)}
        product={adjustStockProduct}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
        }}
      />

      {/* Delete Confirmation Alert Modal */}
      <ConfirmDialog
        isOpen={!!deleteProductCandidate}
        onClose={() => setDeleteProductCandidate(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete '${deleteProductCandidate?.name}'?`}
        message={`Are you sure you want to remove SKU '${deleteProductCandidate?.sku}' from inventory? This will also remove its associated transaction history. This action cannot be undone.`}
        confirmLabel="Delete Product"
        isLoading={deleteMutation.isPending}
      />

      {/* CSV Bulk Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        }}
      />
    </div>
  );
};
