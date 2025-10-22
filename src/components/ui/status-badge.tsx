import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  LucideIcon,
  Package,
  Truck,
  RotateCcw
} from 'lucide-react';

// Type for all possible status values
type OrderStatus =
  | 'completed'
  | 'on-hold'
  | 'pending'
  | 'cancelled'
  | 'processing'
  | 'refunded'
  | 'failed'
  | 'ready-to-ship'
  | 'shipped'
  | 'returned'
  | string; // Allows for custom statuses

// Configuration object for status appearances
const STATUS_CONFIG: Record<
  string,
  {
    icon: LucideIcon;
    bgColor: string;
    textColor: string;
    label?: string; // Optional label for some statuses
  }
> = {
  // REQUIRED COLORS - Exact matches as specified
  pending: {
    icon: Clock,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600'
  },
  processing: {
    icon: Package,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  completed: {
    icon: CheckCircle,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  returned: {
    icon: RotateCcw,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600'
  },
  cancelled: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600'
  },
  
  // ADDITIONAL STATUSES - Different colors to avoid conflicts
  'ready-to-ship': {
    icon: Package,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    label: 'Ready to Ship'
  },
  shipped: {
    icon: Truck,
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600'
  },
  refunded: {
    icon: CheckCircle,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  'on-hold': {
    icon: AlertCircle,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    label: 'On Hold'
  },
  failed: {
    icon: XCircle,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600'
  },
  
  // LEGACY STATUSES - Different colors for backward compatibility
  instock: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    label: 'In Stock'
  },
  outofstock: {
    icon: XCircle,
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    label: 'Out of Stock'
  },
  
  // Default configuration for unknown statuses
  default: {
    icon: AlertCircle,
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-600'
  }
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showIcon?: boolean;
}

const StatusBadge = ({
  status,
  className,
  showIcon = true
}: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;
  const Icon = config.icon;

  return (
    <Badge
      variant='outline'
      className={cn(
        'inline-flex items-center gap-1.5 capitalize',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {showIcon && <Icon className='size-3.5' />}
      {config.label ?? status}
    </Badge>
  );
};

export default StatusBadge;
