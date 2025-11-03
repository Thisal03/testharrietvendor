import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { Product } from './types';
import { CreateProductData } from './create-product';
import { ProductUpdateError } from '@/lib/errors/product-errors';

/**
 * Updates an existing product in WooCommerce
 * 
 * @param {number} productId - The WooCommerce product ID
 * @param {Partial<CreateProductData>} productData - Partial product data to update (only specified fields will be updated)
 * @returns {Promise<Product>} The updated product
 * @throws {Error} If product update fails
 * 
 * @remarks
 * This function updates specific fields of an existing product without affecting unspecified fields.
 * Uses cache: 'no-store' to prevent stale data issues.
 * 
 * @example
 * ```typescript
 * const updatedProduct = await updateProduct(123, {
 *   name: 'Updated Product Name',
 *   regular_price: '39.99'
 * });
 * ```
 */
export const updateProduct = async (
  productId: number,
  productData: Partial<CreateProductData>
): Promise<Product> => {
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
        body: JSON.stringify(productData),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WooCommerce Update API Error:', errorData);
      throw new ProductUpdateError(
        errorData.message || `Failed to update product: HTTP ${response.status}`,
        productId,
        {
          updateData: productData,
          metadata: {
            status: response.status,
            errorData
          }
        }
      );
    }

    const product: Product = await response.json();
    
    return product;
  } catch (error) {
    console.error(`Failed to update product ${productId}:`, error);
    throw error;
  }
};

