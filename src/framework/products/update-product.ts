import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { Product } from './types';
import { CreateProductData } from './create-product';

export const updateProduct = async (
  productId: number,
  productData: Partial<CreateProductData>
): Promise<Product> => {
  try {
    const token = await getAccessToken();

    console.log(`🔄 Updating product ${productId} with data:`, JSON.stringify(productData, null, 2));

    // Use the correct WooCommerce products endpoint
    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WooCommerce Update API Error:', errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const product: Product = await response.json();
    
    console.log(`✅ Product ${productId} updated successfully - Full response:`, {
      id: product.id,
      name: product.name,
      image_id: product.image_id,
      gallery_image_ids: product.gallery_image_ids,
      category_ids: product.category_ids,
      meta_data_keys: product.meta_data?.map(m => m.key) || []
    });
    
    return product;
  } catch (error) {
    console.error(`Failed to update product ${productId}:`, error);
    throw error;
  }
};

