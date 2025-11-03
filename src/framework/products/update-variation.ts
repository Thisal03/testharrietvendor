import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { CreateVariationData } from './create-variation';

export const updateVariation = async (
  productId: number,
  variationId: number,
  variationData: Partial<CreateVariationData>
): Promise<any> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(variationData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to update variation: ${response.status}`
      );
    }

    const variation = await response.json();
    return variation;
  } catch (error) {
    console.error(`Failed to update variation ${variationId} for product ${productId}:`, error);
    throw error;
  }
};

