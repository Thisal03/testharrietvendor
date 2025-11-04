import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/services/token';
import { config } from '@/framework/config';

/**
 * API route to fetch product attributes
 * Proxies the request to WooCommerce API to avoid CORS issues
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/attributes`,
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

    const attributes = await response.json();
    return NextResponse.json(attributes);
  } catch (error) {
    console.error('Failed to fetch attributes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

