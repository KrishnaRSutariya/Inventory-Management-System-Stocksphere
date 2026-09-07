import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { categoryFormSchema, CategoryFormValues } from '../schemas/category.schema';
import { Category } from '../../../types/api.types';

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  category?: Category | null;
  isLoading?: boolean;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading = false
}) => {
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || ''
      });
    } else {
      reset({
        name: '',
        description: ''
      });
    }
  }, [category, reset, isOpen]);

  const handleFormSubmit = async (data: CategoryFormValues) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Category: ${category.name}` : 'Create New Category'}
      description={
        isEditing
          ? 'Update category name and operational description'
          : 'Define a new category segment to classify products'
      }
      maxWidth="md"
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
            {isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Category Name"
          placeholder="e.g. Industrial Automation, Office Furniture"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Brief description of items included under this classification..."
          error={errors.description?.message}
          rows={3}
          {...register('description')}
        />
      </form>
    </Modal>
  );
};
