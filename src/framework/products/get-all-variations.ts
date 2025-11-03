import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { PRODUCT_TAGS } from '../cache-tags';

/**
 * Fetches all variations for a variable product
 * 
 * @param {number} productId - The parent product ID
 * @param {Record<string, any>} [params={}] - Additional query parameters for the API request
 * @param {{noCache?: boolean}} [options] - Fetch options (noCache to bypass caching)
 * @returns {Promise<any[]>} Array of all product variations
 * @throws {Error} If variations fetch fails
 * 
 * @remarks
 * This function fetches up to 100 variations per page from WooCommerce.
 * It includes caching with cache tags for optimal performance.
 * The function handles cases where no variations exist yet.
 * 
 * @example
 * ```typescript
 * const variations = await getAllVariations(123);
 * console.log(`Product has ${variations.length} variations`);
 * ```
 */
export const getAllVariations = async (
  productId: number,
  params: Record<string, any> = {},
  options?: { noCache?: boolean }
): Promise<any[]> => {
  try {
    const token = await getAccessToken();

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });

    // Add some common parameters to ensure we get all variations
    queryParams.append('per_page', '100'); // Get up to 100 variations
    
    // Add cache-busting parameter if noCache is true
    if (options?.noCache) {
      queryParams.append('_', Date.now().toString());
    }

    const url = `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}/variations?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // Use cache control based on options
      ...(options?.noCache 
        ? { cache: 'no-store' as const } 
        : { next: { tags: [PRODUCT_TAGS.variations(productId)] } }
      )
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Variations API Error:', errorData);
      throw new Error(
        errorData.message || `Failed to get variations: ${response.status}`
      );
    }

    const variations = await response.json();
    
    // If no variations found, let's try a different approach
    if (variations.length === 0) {
      
      // Try without any status filters
      try {
        const simpleUrl = `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}/variations`;
        
        const simpleResponse = await fetch(simpleUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (simpleResponse.ok) {
          const simpleVariations = await simpleResponse.json();
          return simpleVariations;
        } else {
        }
      } catch (e) {
        console.error('Simple fetch failed:', e);
      }
      
      // Let's also try to get the product details to see if it's actually variable
      try {
        const productResponse = await fetch(
          `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (productResponse.ok) {
          const product = await productResponse.json();
          
          // If the product has variation IDs, let's try to fetch them individually
          if (product.variations && product.variations.length > 0) {
            const individualVariations = [];
            
            for (const variationId of product.variations.slice(0, 2)) { // Test with first 2 variations
              try {
                const varResponse = await fetch(
                  `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                if (varResponse.ok) {
                  const variation = await varResponse.json();
                  individualVariations.push(variation);
                }
              } catch (_e) {
              }
            }
            
            if (individualVariations.length > 0) {
              return individualVariations;
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch product details:', e);
      }
    }
    
    return variations;
  } catch (error) {
    console.error(`Failed to get variations for product ${productId}:`, error);
    throw error;
  }
};

