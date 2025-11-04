import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/services/token';
import { config } from '@/framework/config';

/**
 * API route to fetch vendor information
 * Proxies the request to WooCommerce API to avoid CORS issues
 */
export async function GET() {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/vendor`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract vendor information from the response
    const vendorInfo = {
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
    
    return NextResponse.json(vendorInfo);
  } catch (error) {
    console.error('Error fetching vendor info:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

