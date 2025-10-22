import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';

export interface VendorInfo {
  id: number;
  name: string;
  store_name?: string;
  shop_name?: string;
  display_name?: string;
  email: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  [key: string]: any; // For additional fields
}

export const getVendorInfo = async (): Promise<VendorInfo | null> => {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/vendor`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract vendor information from the response
    const vendorInfo: VendorInfo = {
      id: data.id || 0,
      name: data.store_name || 'Store',
      store_name: data.store_name,
      shop_name: data.store_name, // Use store_name as shop_name
      display_name: data.store_name,
      email: data.email || '',
      description: data.description || '',
      address: data.address?.street_1 || '',
      phone: data.phone || '',
      website: data.store_url || '',
      ...data // Include all other fields
    };
    
    return vendorInfo;
  } catch (error) {
    console.error('Error fetching vendor info:', error);
    return null;
  }
};
