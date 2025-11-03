import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { Product } from './types';
import { PRODUCT_TAGS } from '../cache-tags';

export const getProductById = async (
  productId: number,
  options?: { noCache?: boolean }
): Promise<Product | null> => {
  try {
    const token = await getAccessToken();

    // Add timestamp to URL to bust cache if requested
    const url = new URL(`${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}`);
    if (options?.noCache) {
      url.searchParams.set('_', Date.now().toString());
    }

    // Use the correct WooCommerce products endpoint
    const response = await fetch(
      url.toString(),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Use cache control based on options
        ...(options?.noCache 
          ? { cache: 'no-store' as const } 
          : { next: { tags: [PRODUCT_TAGS.product(productId)] } }
        )
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const product: Product = await response.json();
    
    return product;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return null;
  }
};
