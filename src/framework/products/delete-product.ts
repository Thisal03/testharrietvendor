import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';

export const deleteProduct = async (productId: number): Promise<boolean> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/vendor-products/${productId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        next: {
          tags: [`woocommerce-product-${productId}`] // For Next.js caching
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    throw error;
  }
};
