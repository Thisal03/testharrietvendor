import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/services/token';
import { config } from '@/framework/config';

/**
 * API route to fetch product categories
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

    // Fetch all categories (WooCommerce max is 100 per page, so we need pagination)
    let allCategories: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/categories?per_page=100&page=${page}`,
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

      const categories = await response.json();
      allCategories = [...allCategories, ...categories];

      // Check if there are more pages
      const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);
      hasMore = page < totalPages;
      page++;
    }
    
    return NextResponse.json(allCategories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

