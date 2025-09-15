'use server';
import { config } from '../config';
import { Order } from './types';
import { getAccessToken } from '@/lib/services/token';
import { ORDER_TAGS } from '../cache-tags';
import { revalidateTag, revalidatePath } from 'next/cache';

export const updateOrderStatus = async (
  orderId: number,
  status: string
): Promise<Order> => {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('User is not authenticated. No access token found.');
    }

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/vendor-orders/${orderId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/vendor-orders/${orderId}`,
        requestBody: { status }
      });
      
      if (response.status === 404) {
        throw new Error(`Order with ID ${orderId} not found`);
      } else if (response.status === 400) {
        throw new Error(`Bad request: ${errorText}`);
      } else if (response.status === 401) {
        throw new Error('Unauthorized: Invalid or expired token');
      } else if (response.status === 403) {
        throw new Error('Forbidden: Insufficient permissions');
      } else if (response.status === 500) {
        throw new Error(`WordPress server error: ${errorText}`);
      } else {
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
    }

    const updatedOrder = await response.json();

    // Use efficient cache invalidation with reasonable upper limits
    const cacheTags = ORDER_TAGS.efficientInvalidateOrderCaches(orderId, 20);
    cacheTags.forEach((tag: string) => {
      revalidateTag(tag);
    });

    revalidatePath(`/dashboard/order/${orderId}`);
    revalidatePath('/dashboard/order');

    return updatedOrder;
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
    throw error;
  }
};
