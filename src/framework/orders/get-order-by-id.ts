import { config } from '../config';
import { Order } from './types';
import { ORDER_TAGS } from '../cache-tags';
import { ONE_HOUR } from '@/constants/utils';
import { getAccessToken } from '@/lib/services/token';

export const getOrderById = async (orderId: number): Promise<Order | null> => {
  try {
    const token = await getAccessToken();

    const apiUrl = `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/vendor-orders/${orderId}?timestamp=${Date.now()}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: {
        revalidate: 0,
        tags: [ORDER_TAGS.order(orderId)]
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const order: Order = await response.json();
    return order;
  } catch (error) {
    console.error(`Failed to fetch order ${orderId}:`, error);
    return null;
  }
};
