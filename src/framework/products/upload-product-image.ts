import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';

export interface UploadedImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

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

    console.log('Uploading image to:', `${config.WORDPRESS_SITE_URL}/wp-json/wp/v2/media`);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    // Try multiple endpoints in order of preference
    const endpoints = [
      `${config.WORDPRESS_SITE_URL}/wp-json/wp/v2/media`,
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/media`,
      `${config.WORDPRESS_SITE_URL}/wp-json/wp/v2/media?context=edit`
    ];

    let lastError;
    
    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const mediaData = await response.json();
          console.log('Successfully uploaded image:', mediaData);
          
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
): Promise<UploadedImage[]> => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      try {
        return await uploadProductImage(file);
      } catch (error) {
        console.error(`Failed to upload image ${file.name}, creating fallback:`, error);
        // Create a fallback image object with a data URL
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        return {
          id: Date.now() + index, // Generate a temporary ID
          src: dataUrl,
          name: file.name,
          alt: ''
        };
      }
    });
    
    const uploadedImages = await Promise.all(uploadPromises);
    return uploadedImages;
  } catch (error) {
    console.error('Failed to upload multiple images:', error);
    throw error;
  }
};

