import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';

/**
 * Product image data structure
 * 
 * @interface ProductImage
 * @property {number} id - WordPress attachment ID
 * @property {string} src - Full URL to the image
 * @property {string} name - Image file name
 * @property {string} alt - Alt text for accessibility
 */
export interface ProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

/**
 * Fetches all images associated with a product
 * 
 * @param {number} productId - The product ID
 * @returns {Promise<ProductImage[]>} Array of product images (featured + gallery)
 * 
 * @remarks
 * Fetches both featured image and gallery images from the product.
 * Returns an empty array on error to prevent crashes.
 * Uses caching with 5-minute revalidation for performance.
 * 
 * @example
 * ```typescript
 * const images = await getProductImages(123);
 * console.log(`Product has ${images.length} images`);
 * ```
 */
export const getProductImages = async (productId: number): Promise<ProductImage[]> => {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.error('No access token available for fetching product images');
      return [];
    }

    // Use the correct WooCommerce products endpoint
    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}?timestamp=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        next: {
          revalidate: 300 // Cache for 5 minutes
        }
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch product ${productId}:`, response.status, response.statusText);
      // Try to get error details from response
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (_e) {
        // Ignore JSON parse errors
      }
      return [];
    }

    const product = await response.json();
    
    // Extract images from the product data
    const images: ProductImage[] = [];
    
    // Featured image and gallery images
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((image: any) => {
        if (image && typeof image === 'object' && image.src && typeof image.src === 'string') {
          images.push({
            id: image.id || 0,
            src: image.src,
            name: image.name || '',
            alt: image.alt || ''
          });
        }
      });
    }
    
    return images;
  } catch (error) {
    console.error(`Error fetching product ${productId} images:`, error);
    return [];
  }
};

// Helper function to get the first/featured image
export const getProductFeaturedImage = async (productId: number): Promise<string | null> => {
  const images = await getProductImages(productId);
  return images.length > 0 ? images[0].src : null;
};
