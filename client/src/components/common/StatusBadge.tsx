import React from 'react';
import { Badge } from '../ui/Badge';
import { StockStatus } from '../../types/api.types';

export interface StatusBadgeProps {
  status?: StockStatus;
  quantity?: number;
  threshold?: number;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  quantity,
  threshold = 10,
  className
}) => {
  let effectiveStatus = status;

  // Double-safeguard: derive status from quantity if not provided
  if (!effectiveStatus && quantity !== undefined) {
    if (quantity <= 0) {
      effectiveStatus = StockStatus.OUT_OF_STOCK;
    } else if (quantity <= threshold) {
      effectiveStatus = StockStatus.LOW_STOCK;
    } else {
      effectiveStatus = StockStatus.IN_STOCK;
    }
  }

  // Final fallback if undefined
  if (!effectiveStatus) {
    effectiveStatus = StockStatus.IN_STOCK;
  }

  switch (effectiveStatus) {
    case StockStatus.IN_STOCK:
      return (
        <Badge variant="success" dot className={className}>
          In Stock
        </Badge>
      );
    case StockStatus.LOW_STOCK:
      return (
        <Badge variant="warning" dot className={className}>
          Low Stock
        </Badge>
      );
    case StockStatus.OUT_OF_STOCK:
      return (
        <Badge variant="danger" dot className={className}>
          Out of Stock
        </Badge>
      );
    default:
      return (
        <Badge variant="default" className={className}>
          {effectiveStatus}
        </Badge>
      );
  }
};
