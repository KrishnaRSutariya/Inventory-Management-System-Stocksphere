import { Schema, model } from 'mongoose';
import { IProduct } from './product.types';
import { env } from '../../config/env';
import { calculateStockStatus } from '../../common/utils/stockStatus';

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'SKU must be at least 3 characters'],
      maxlength: [50, 'SKU cannot exceed 50 characters']
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer'
      }
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0.01, 'Unit price must be greater than zero']
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      minlength: [2, 'Supplier name must be at least 2 characters'],
      maxlength: [100, 'Supplier name cannot exceed 100 characters']
    },
    lowStockThreshold: {
      type: Number,
      default: env.DEFAULT_LOW_STOCK_THRESHOLD,
      min: [1, 'Low stock threshold must be at least 1']
    },
    barcode: {
      type: String,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete (ret as any).__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true
    }
  }
);

// Virtual field for dynamic stock status
productSchema.virtual('status').get(function (this: IProduct) {
  return calculateStockStatus(this.quantity, this.lowStockThreshold);
});

productSchema.index({ name: 'text', description: 'text', supplierName: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ quantity: 1 });
productSchema.index({ unitPrice: 1 });
productSchema.index({ createdAt: -1 });

export const ProductModel = model<IProduct>('Product', productSchema);
