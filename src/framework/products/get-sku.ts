import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';

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
    // Use Next.js API route to avoid CORS issues
    const queryParams = new URLSearchParams({
      sku: sku,
    });
    
    if (excludeProductId) {
      queryParams.append('excludeProductId', excludeProductId.toString());
    }
    if (excludeVariationId) {
      queryParams.append('excludeVariationId', excludeVariationId.toString());
    }
    if (checkDisabledVariations) {
      queryParams.append('checkDisabledVariations', 'true');
    }
    if (excludeVariationSku) {
      queryParams.append('excludeVariationSku', excludeVariationSku);
    }

    const response = await fetch(`/api/products/check-sku?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to check SKU availability:', response.status, response.statusText);
      // Fail closed: assume NOT available if we can't verify
      return {
        isAvailable: false,
        confidence: 'low',
        error: errorData.error || `Unable to verify SKU availability: ${response.statusText}`
      };
    }

    const result: SKUCheckResult = await response.json();
    return result;
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
    // Use Next.js API route to avoid CORS issues
    const response = await fetch(`/api/products/check-sku?sku=${encodeURIComponent(sku)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to get SKU details:', response.status, response.statusText);
      return { 
        isAvailable: true, // Assume available if we can't check
        confidence: 'low',
        error: errorData.error
      };
    }

    const result: SKUCheckResult = await response.json();
    return result;
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
    // Use Next.js API route to avoid CORS issues
    const response = await fetch(`/api/products/check-sku?sku=${encodeURIComponent(sku)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get product by SKU: ${response.status} ${response.statusText}`);
    }

    const result: SKUCheckResult = await response.json();
    
    // If SKU is not available, return the existing product
    if (!result.isAvailable && result.existingProduct) {
      // We need to fetch the full product details
      // For now, return what we have from the SKU check
      return {
        id: result.existingProduct.id,
        name: result.existingProduct.name,
        sku: result.existingProduct.sku,
        status: result.existingProduct.status
      } as any;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting product by SKU:', error);
    throw error;
  }
};
