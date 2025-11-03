import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
}

export const getCategories = async (): Promise<ProductCategory[]> => {
  try {
    const token = await getAccessToken();

    // Fetch all categories (WooCommerce max is 100 per page, so we need pagination)
    let allCategories: ProductCategory[] = [];
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
          cache: 'no-store' // Disable caching to always get fresh data
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const categories: ProductCategory[] = await response.json();
      allCategories = [...allCategories, ...categories];

      // Check if there are more pages
      const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);
      hasMore = page < totalPages;
      page++;
    }
    
    return allCategories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

