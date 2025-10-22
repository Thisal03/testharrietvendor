import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';

export interface SKUCheckResult {
  isAvailable: boolean;
  existingProduct?: {
    id: number;
    name: string;
    sku: string;
    status: string;
  };
}

export const checkSKUAvailability = async (sku: string): Promise<boolean> => {
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
      return true; // Assume available if we can't check
    }

    const data = await response.json();
    console.log('SKU check response for SKU:', sku, 'Products found:', data.length);
    
    // If any products are returned, the SKU is already taken
    return data.length === 0;
  } catch (error) {
    console.error('Error checking SKU availability:', error);
    return true; // Assume available if there's an error
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
      return { isAvailable: true }; // Assume available if we can't check
    }

    const data = await response.json();
    console.log('SKU details response for SKU:', sku, 'Products found:', data.length);
    
    if (data.length === 0) {
      return { isAvailable: true };
    }

    // Return details of the first product found with this SKU
    const existingProduct = data[0];
    return {
      isAvailable: false,
      existingProduct: {
        id: existingProduct.id,
        name: existingProduct.name,
        sku: existingProduct.sku,
        status: existingProduct.status
      }
    };
  } catch (error) {
    console.error('Error getting SKU details:', error);
    return { isAvailable: true }; // Assume available if there's an error
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
