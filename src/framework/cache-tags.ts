export const ORDER_TAGS = {
  order: (orderId: number) => `order-${orderId}`,
  orders: (page: number, perPage: number, queryParams: string) =>
    `orders-${page}-${perPage}-${queryParams}`,
  
  // Efficient cache invalidation with reasonable upper limits
  efficientInvalidateOrderCaches: (orderId: number, maxPages: number = 20) => {
    const baseTags = [`order-${orderId}`];
    const commonPerPageSizes = [10, 20, 50, 100];
    
    // Generate tags for reasonable number of pages
    const tags: string[] = [];
    for (let page = 1; page <= Math.min(maxPages, 20); page++) {
      for (const perPage of commonPerPageSizes) {
        tags.push(`orders-${page}-${perPage}-`);
      }
    }
    
    return [...baseTags, ...tags];
  },
  
  // Status-specific cache tags for better invalidation
  status: (status: string) => `orders-status-${status}`,
  
  // Invalidate status-specific caches when order status changes
  invalidateStatusCaches: (oldStatus: string, newStatus: string) => [
    `orders-status-${oldStatus}`,
    `orders-status-${newStatus}`
  ]
};

export const PRODUCT_TAGS = {
  product: (productId: number) => `product-${productId}`,
  products: (page: number, perPage: number, queryParams: string) =>
    `products-${page}-${perPage}-${queryParams}`,
  variations: (productId: number) => `variations-${productId}`
};

export const TRACKING_TAGS = {
  waybill: (trackingId: string) => `waybill-${trackingId}`
};
