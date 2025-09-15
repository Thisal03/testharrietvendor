import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  LucideIcon
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
  completed: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  instock: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    label: 'In Stock'
  },
  outofstock: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    label: 'Out of Stock'
  },
  'ready-to-ship': {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    label: 'Ready to Ship'
  },
  pending: {
    icon: Clock,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-500'
  },
  'on-hold': {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-500',
    label: 'On Hold'
  },
  cancelled: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600'
  },
  processing: {
    icon: Clock,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  refunded: {
    icon: CheckCircle,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  failed: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600'
  },
  // Default configuration for unknown statuses
  default: {
    icon: AlertCircle,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600'
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
