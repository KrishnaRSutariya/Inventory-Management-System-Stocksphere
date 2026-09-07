import { Schema, model } from 'mongoose';
import { IInventoryTransaction } from './inventory.types';
import { InventoryTransactionType } from '../../common/constants/stockStatus';

const inventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    type: {
      type: String,
      enum: Object.values(InventoryTransactionType),
      required: [true, 'Transaction type (IN or OUT) is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Transaction quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer'
      }
    },
    previousQuantity: {
      type: Number,
      required: true,
      min: [0, 'Previous quantity cannot be negative']
    },
    newQuantity: {
      type: Number,
      required: true,
      min: [0, 'New quantity cannot be negative']
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters']
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
      transform(_doc, ret) {
        delete (ret as any).__v;
        return ret;
      }
    }
  }
);

inventoryTransactionSchema.index({ product: 1, createdAt: -1 });
inventoryTransactionSchema.index({ type: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });

export const InventoryTransactionModel = model<IInventoryTransaction>(
  'InventoryTransaction',
  inventoryTransactionSchema
);
