import { config } from '../config';
import { TRACKING_TAGS } from '../cache-tags';
import { ONE_HOUR } from '@/constants/utils';

export const getWaybill = async (trackingId: string): Promise<any> => {
  try {
    const response = await fetch(
      `${config.CITYPAK_SITE_URL}?tracking_numbers[]=${trackingId}&page_size=4X6`,
      {
        headers: {
          Authorization: `Bearer ${config.CITYPAK_TOKEN}`
        },
        next: {
          revalidate: ONE_HOUR,
          tags: [TRACKING_TAGS.waybill(trackingId)]
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Waybill with tracking ID ${trackingId} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const waybill: any = await response.blob();
    return waybill;
  } catch (error) {
    console.error(`Failed to fetch waybill ${trackingId}:`, error);
    throw error;
  }
};
