import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { Product } from './types';
import { PRODUCT_TAGS } from '../cache-tags';

export const getProductById = async (
  productId: number
): Promise<Product | null> => {
  try {
    const token = await getAccessToken();

    // Use the correct WooCommerce products endpoint
    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        next: {
          tags: [PRODUCT_TAGS.product(productId)] // For Next.js caching
        }
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
