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
    // Use Next.js API route to avoid CORS issues
    const response = await fetch('/api/vendor/info', {
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No access token found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const vendorInfo: VendorInfo = await response.json();
    return vendorInfo;
  } catch (error) {
    console.error('Error fetching vendor info:', error);
    return null;
  }
};
