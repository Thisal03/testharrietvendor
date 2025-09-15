import { config } from '../config';
import { Order } from './types';
import { ORDER_TAGS } from '../cache-tags';
import { ONE_HOUR } from '@/constants/utils';
import { getAccessToken } from '@/lib/services/token';
import { logger } from '@/lib/logger';

interface OrderParams {
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

export interface OrdersResponse {
  data: Order[];
  pagination: PaginationData;
}

export const getOrders = async (
  params: OrderParams
): Promise<OrdersResponse | null> => {
  try {
    // Check if required environment variables are set
    if (!config.WORDPRESS_SITE_URL) {
      logger.error('WORDPRESS_SITE_URL environment variable is not set');
      throw new Error('WORDPRESS_SITE_URL environment variable is not set');
    }

    const token = await getAccessToken();
    
    if (!token) {
      logger.error('No access token available');
      throw new Error('No access token available');
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    queryParams.append('timestamp', Date.now().toString());

    const url = `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/vendor-orders?${queryParams.toString()}`;
    logger.log('Fetching orders from:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: {
        revalidate: ONE_HOUR,
        tags: [
          ORDER_TAGS.orders(
            params.page,
            params.per_page,
            queryParams.toString()
          )
        ]
      }
    });

    logger.log('Orders API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Orders API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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
    logger.log('Orders fetched successfully:', data.length, 'orders');

    return {
      data,
      pagination
    };
  } catch (error) {
    logger.error('Failed to fetch orders:', error);
    logger.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return null;
  }
};
