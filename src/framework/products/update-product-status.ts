import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { invalidatePath } from '../revalidate';

export type ProductStatus = 'draft' | 'pending' | 'publish' | 'private' | 'trash';

export const updateProductStatus = async (
  productId: number,
  status: ProductStatus
): Promise<{ success: boolean; message: string }> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status }),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WooCommerce Update Status API Error:', errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const _product = await response.json();
    
    // Revalidate the product listing page and the specific product page
    await invalidatePath('/dashboard/product');
    await invalidatePath(`/dashboard/product/${productId}`);
    
    const message = status === 'publish' 
      ? 'Product published successfully'
      : status === 'pending'
      ? 'Product set to pending review'
      : status === 'draft'
      ? 'Product saved as draft'
      : status === 'private'
      ? 'Product set to private'
      : 'Product moved to trash';
    
    return {
      success: true,
      message
    };
  } catch (error) {
    console.error(`Failed to update product status ${productId}:`, error);
    throw error;
  }
};

