import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { Product } from './types';
import { PRODUCT_TAGS } from '../cache-tags';

interface ProductParams {
  page: number;
  per_page: number;
  [key: string]: any; // for additional optional parameters
}

interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface ProductsResponse {
  data: Product[];
  pagination: PaginationData;
}

export const getProducts = async (
  params: ProductParams
): Promise<ProductsResponse | null> => {
  try {
    const token = await getAccessToken();

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });

    // Exclude trashed products by default
    if (!params.status) {
      queryParams.append('status', 'any'); // Fetch all statuses
    }

    queryParams.append('timestamp', Date.now().toString());

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/vendor-products?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        next: {
          tags: [
            PRODUCT_TAGS.products(
              params.page,
              params.per_page,
              queryParams.toString()
            )
          ]
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Extract pagination data from headers
    const headers = response.headers;
    const pagination: PaginationData = {
      total: parseInt(headers.get('x-wp-total') || '0', 10),
      totalPages: parseInt(headers.get('x-wp-totalpages') || '0', 10),
      currentPage: params.page,
      perPage: params.per_page
    };

    const data = await response.json();
    
    // Filter out trashed products from the response
    const filteredData = data.filter((product: Product) => product.status !== 'trash');

    return {
      data: filteredData,
      pagination
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return null;
  }
};
