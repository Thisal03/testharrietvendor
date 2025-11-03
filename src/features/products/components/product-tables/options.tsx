// Product status options (different from order statuses)
export const PRODUCT_STATUS_OPTIONS = [
  { value: 'publish', label: 'Published' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'draft', label: 'Draft' },
  { value: 'private', label: 'Private' }
];

// Order status options (for reference - not used in product listing)
export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready-to-ship', label: 'Ready to Ship' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'failed', label: 'Failed' }
];

// Export for backward compatibility
export const STATUS_OPTIONS = PRODUCT_STATUS_OPTIONS;
