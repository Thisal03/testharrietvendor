import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { ImageUploadError } from '@/lib/errors/product-errors';

/**
 * Result of an image upload to WordPress media library
 * 
 * @interface UploadedImage
 * @property {number} id - WordPress attachment ID
 * @property {string} src - Full URL to the uploaded image
 * @property {string} name - Original file name
 * @property {string} alt - Alt text for accessibility
 */
export interface UploadedImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

/**
 * Result structure for image upload with status tracking
 * 
 * @interface UploadResult
 * @property {UploadedImage | null} image - The uploaded image or null if failed
 * @property {'success' | 'failed' | 'fallback'} status - Upload status
 * @property {string} [error] - Error message if status is 'failed'
 * @property {string} [fileName] - Original file name
 */
export interface UploadResult {
  image: UploadedImage | null;
  status: 'success' | 'failed' | 'fallback';
  error?: string;
  fileName?: string;
}

/**
 * Uploads a product image to WordPress media library with fallback endpoints
 * 
 * @param {File} file - The image file to upload
 * @returns {Promise<UploadedImage>} The uploaded image with ID and URL
 * @throws {ImageUploadError} If all upload endpoints fail
 * 
 * @remarks
 * This function attempts multiple WordPress API endpoints in order:
 * 1. `/wp-json/wp/v2/media` (standard REST API)
 * 2. `/wp-json/wc/v3/media` (WooCommerce endpoint)
 * 3. `/wp-json/wp/v2/media?context=edit` (edit context endpoint)
 * 
 * If all endpoints fail, it throws an ImageUploadError with details.
 * This provides resilience against different WordPress configurations.
 * 
 * @example
 * ```typescript
 * try {
 *   const uploadedImage = await uploadProductImage(imageFile);
 *   console.log('Image uploaded:', uploadedImage.id, uploadedImage.src);
 * } catch (error) {
 *   console.error('Upload failed:', error.message);
 * }
 * ```
 */
export const uploadProductImage = async (
  file: File
): Promise<UploadedImage> => {
  try {
    const token = await getAccessToken();
    
    if (!token) {
      throw new Error('No access token available for image upload');
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    // Try multiple endpoints in order of preference
    const endpoints = [
      `${config.WORDPRESS_SITE_URL}/wp-json/wp/v2/media`,
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/media`,
      `${config.WORDPRESS_SITE_URL}/wp-json/wp/v2/media?context=edit`
    ];

    let lastError;
    
    for (const endpoint of endpoints) {
      try {
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const mediaData = await response.json();
          
          return {
            id: mediaData.id,
            src: mediaData.source_url || mediaData.guid?.rendered || mediaData.url,
            name: mediaData.title?.rendered || mediaData.slug || file.name,
            alt: mediaData.alt_text || ''
          };
        } else {
          const errorText = await response.text();
          console.error(`Endpoint ${endpoint} failed:`, response.status, errorText);
          lastError = new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Endpoint ${endpoint} error:`, error);
        lastError = error;
      }
    }

    // If all endpoints failed, throw the last error
    throw lastError || new Error('All upload endpoints failed');

  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (
  files: File[]
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = files.map(async (file) => {
      try {
        const image = await uploadProductImage(file);
        return {
          image,
          status: 'success' as const,
          fileName: file.name
        };
      } catch (error) {
        console.error(`Failed to upload image ${file.name}:`, error);
        return {
          image: null,
          status: 'failed' as const,
          error: error instanceof Error ? error.message : String(error),
          fileName: file.name
        };
      }
    });
    
    const results = await Promise.all(uploadPromises);
    
    // Check if any uploads failed
    const failedUploads = results.filter(r => r.status === 'failed');
    if (failedUploads.length > 0) {
      const errorMessage = `${failedUploads.length} of ${files.length} images failed to upload`;
      throw new ImageUploadError(errorMessage, {
        metadata: {
          total: files.length,
          failed: failedUploads.length,
          succeeded: results.length - failedUploads.length,
          failedFiles: failedUploads.map(r => r.fileName)
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Failed to upload multiple images:', error);
    throw error;
  }
};

/**
 * Legacy function maintained for backward compatibility
 * Wraps new uploadMultipleImages and extracts only successful uploads
 */
export const uploadMultipleImagesLegacy = async (
  files: File[]
): Promise<UploadedImage[]> => {
  const results = await uploadMultipleImages(files);
  
  const successful = results
    .filter(r => r.status === 'success' && r.image !== null)
    .map(r => r.image as UploadedImage);
  
  if (successful.length === 0) {
    throw new ImageUploadError('All image uploads failed');
  }
  
  return successful;
};

