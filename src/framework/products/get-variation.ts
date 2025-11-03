import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';

export const getVariation = async (
  productId: number,
  variationId: number
): Promise<any> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to get variation: ${response.status}`
      );
    }

    const variation = await response.json();
    return variation;
  } catch (error) {
    console.error(`Failed to get variation ${variationId} for product ${productId}:`, error);
    throw error;
  }
};

