import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { getProductById } from './get-product-by-id';

/**
 * Result of SKU availability check
 * 
 * @interface SKUCheckResult
 * @property {boolean} isAvailable - Whether the SKU is available (true) or already in use (false)
 * @property {string} [error] - Error message if check failed
 * @property {'high' | 'low'} confidence - Confidence level of the result ('high' for confirmed, 'low' for failed checks)
 * @property {{id: number, name: string, sku: string, status: string}} [existingProduct] - Details of existing product with this SKU
 */
export interface SKUCheckResult {
  isAvailable: boolean;
  error?: string;
  confidence: 'high' | 'low';
  existingProduct?: {
    id: number;
    name: string;
    sku: string;
    status: string;
  };
}

/**
 * Checks if a SKU is available for use, excluding specified products/variations
 * 
 * @param {string} sku - The SKU to check
 * @param {number} [excludeProductId] - Product ID to exclude from check (e.g., current product being edited)
 * @param {number} [excludeVariationId] - Variation ID to exclude from check
 * @param {boolean} [checkDisabledVariations] - Whether to check disabled variations
 * @param {string} [excludeVariationSku] - SKU to exclude from check
 * @returns {Promise<SKUCheckResult>} Result indicating availability and confidence level
 * 
 * @remarks
 * This function checks SKU availability across all products and variations.
 * It properly handles excluded products/variations and can check disabled variations
 * that might be stored in product meta_data.
 * 
 * The function uses a "fail-closed" approach: if the API check fails, it assumes
 * the SKU is NOT available to prevent duplicate SKUs.
 * 
 * @example
 * ```typescript
 * const result = await checkSKUAvailability('NEW-SKU-001', productId, variationId);
 * if (!result.isAvailable) {
 *   console.error('SKU already in use:', result.existingProduct);
 * }
 * ```
 */
export const checkSKUAvailability = async (
  sku: string, 
  excludeProductId?: number, 
  excludeVariationId?: number,
  checkDisabledVariations?: boolean,
  excludeVariationSku?: string
): Promise<SKUCheckResult> => {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to check SKU availability:', response.status, response.statusText);
      // Fail closed: assume NOT available if we can't verify
      return {
        isAvailable: false,
        confidence: 'low',
        error: `Unable to verify SKU availability: ${response.statusText}`
      };
    }

    const data = await response.json();
    
    // Filter out the current product/variation if we're editing
    const otherProducts = data.filter((product: any) => {
      // Always exclude the specified product ID
      if (excludeProductId && product.id === excludeProductId) return false;
      
      // Also exclude the variation ID if specified
      if (excludeVariationId && product.id === excludeVariationId) return false;
      
      return true;
    });
    
    // Check disabled variations in meta_data
    if (checkDisabledVariations && excludeProductId) {
      try {
        const product = await getProductById(excludeProductId, { noCache: true });
        if (product?.meta_data) {
          const disabledVars = product.meta_data.find((m: any) => m.key === '_disabled_variations')?.value;
          if (disabledVars && typeof disabledVars === 'string') {
            const disabled = JSON.parse(disabledVars);
            // Check if SKU exists in disabled variations, but exclude the current variation's SKU
            const hasSKU = disabled.some((v: any) => {
              // Skip checking against the variation itself
              if (excludeVariationSku && v.sku === excludeVariationSku) {
                return false;
              }
              return v.sku === sku;
            });
            if (hasSKU) {
              return {
                isAvailable: false,
                confidence: 'high',
                error: 'SKU is reserved by a disabled variation'
              };
            }
          }
        }
      } catch (_metaError) {
        // Silently fail meta_data check, continue with WooCommerce check
      }
    }
    
    // If any other products have this SKU, it's already taken
    const isAvailable = otherProducts.length === 0;
    return {
      isAvailable,
      confidence: 'high'
    };
  } catch (error) {
    console.error('Error checking SKU availability:', error);
    // Fail closed: assume NOT available if there's an error
    return {
      isAvailable: false,
      confidence: 'low',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getSKUDetails = async (sku: string): Promise<SKUCheckResult> => {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to get SKU details:', response.status, response.statusText);
      return { 
        isAvailable: true, // Assume available if we can't check
        confidence: 'low'
      };
    }

    const data = await response.json();
    
    if (data.length === 0) {
      return { 
        isAvailable: true,
        confidence: 'high'
      };
    }

    // Return details of the first product found with this SKU
    const existingProduct = data[0];
    return {
      isAvailable: false,
      confidence: 'high',
      existingProduct: {
        id: existingProduct.id,
        name: existingProduct.name,
        sku: existingProduct.sku,
        status: existingProduct.status
      }
    };
  } catch (error) {
    console.error('Error getting SKU details:', error);
    return { 
      isAvailable: true, // Assume available if there's an error
      confidence: 'low',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getProductBySKU = async (sku: string) => {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get product by SKU: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting product by SKU:', error);
    throw error;
  }
};
