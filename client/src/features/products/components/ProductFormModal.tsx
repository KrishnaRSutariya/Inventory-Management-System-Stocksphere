import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { productFormSchema, ProductFormValues } from '../schemas/product.schema';
import { Product, Category } from '../../../types/api.types';

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  product?: Product | null;
  categories: Category[];
  isLoading?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
  isLoading = false
}) => {
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      description: '',
      quantity: 0,
      unitPrice: 10,
      supplierName: '',
      lowStockThreshold: 10,
      barcode: ''
    }
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        category: product.category?._id || '',
        description: product.description || '',
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        supplierName: product.supplierName,
        lowStockThreshold: product.lowStockThreshold || 10,
        barcode: product.barcode || ''
      });
    } else {
      reset({
        name: '',
        sku: '',
        category: categories[0]?._id || '',
        description: '',
        quantity: 0,
        unitPrice: 10,
        supplierName: '',
        lowStockThreshold: 10,
        barcode: ''
      });
    }
  }, [product, categories, reset, isOpen]);

  const handleFormSubmit = async (data: ProductFormValues) => {
    await onSubmit({
      ...data,
      sku: data.sku.toUpperCase().trim()
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Product: ${product.name}` : 'Add New Inventory Product'}
      description={
        isEditing
          ? 'Modify catalog details, pricing, and stock thresholds'
          : 'Register a new item with unique SKU, supplier, and initial stock'
      }
      maxWidth="2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(handleFormSubmit)}
            isLoading={isLoading}
          >
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Name & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            placeholder="e.g. Ergonomic Office Chair"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Input
            label="SKU (Stock Keeping Unit)"
            placeholder="e.g. FUR-AERON-01"
            error={errors.sku?.message}
            required
            helperText="Must be unique across entire inventory"
            {...register('sku')}
          />
        </div>

        {/* Category & Supplier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            error={errors.category?.message}
            required
            {...register('category')}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Input
            label="Supplier Name"
            placeholder="e.g. Herman Miller Direct"
            error={errors.supplierName?.message}
            required
            {...register('supplierName')}
          />
        </div>

        {/* Quantity, Unit Price & Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Quantity"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            error={errors.quantity?.message}
            required
            {...register('quantity', { valueAsNumber: true })}
          />

          <Input
            label="Unit Price ($)"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="99.99"
            error={errors.unitPrice?.message}
            required
            {...register('unitPrice', { valueAsNumber: true })}
          />

          <Input
            label="Low Stock Alert Threshold"
            type="number"
            min="1"
            step="1"
            placeholder="10"
            error={errors.lowStockThreshold?.message}
            helperText="Alerts when qty <= threshold"
            {...register('lowStockThreshold', { valueAsNumber: true })}
          />
        </div>

        {/* Barcode / QR Code Reference */}
        <Input
          label="Barcode / Code Reference (Optional)"
          placeholder="e.g. 789123456789 (Defaults to SKU if left blank)"
          error={errors.barcode?.message}
          {...register('barcode')}
        />

        {/* Description */}
        <Textarea
          label="Product Description (Optional)"
          placeholder="Add detailed technical specifications, dimensions, or warehouse shelf coordinates..."
          error={errors.description?.message}
          rows={3}
          {...register('description')}
        />
      </form>
    </Modal>
  );
};
