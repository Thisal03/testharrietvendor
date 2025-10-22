import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';

export interface CreateVariationData {
  regular_price: string;
  sale_price?: string;
  date_on_sale_from?: string;
  date_on_sale_to?: string;
  stock_quantity: number;
  sku?: string;
  weight?: string;
  attributes: Array<{
    id?: number;
    name?: string;
    option: string;
  }>;
  image?: { id: number } | { src: string };
  // Additional fields for better WooCommerce compatibility
  manage_stock?: boolean | 'parent';
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
  backorders?: 'no' | 'notify' | 'yes';
  tax_status?: 'taxable' | 'shipping' | 'none';
  tax_class?: string;
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
  };
  status?: 'draft' | 'pending' | 'private' | 'publish';
  meta_data?: Array<{
    key: string;
    value: any;
  }>;
}

export const createVariation = async (
  productId: number,
  variationData: CreateVariationData
): Promise<any> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}/variations`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(variationData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to create variation: ${response.status}`
      );
    }

    const variation = await response.json();
    return variation;
  } catch (error) {
    console.error(`Failed to create variation for product ${productId}:`, error);
    throw error;
  }
};

export const createMultipleVariations = async (
  productId: number,
  variations: CreateVariationData[]
): Promise<any[]> => {
  try {
    const createdVariations = [];
    for (const variationData of variations) {
      const variation = await createVariation(productId, variationData);
      createdVariations.push(variation);
    }
    return createdVariations;
  } catch (error) {
    console.error(`Failed to create variations for product ${productId}:`, error);
    throw error;
  }
};

export const getVariation = async (
  productId: number,
  variationId: number
): Promise<any> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to get variation: ${response.status}`
      );
    }

    const variation = await response.json();
    return variation;
  } catch (error) {
    console.error(`Failed to get variation ${variationId} for product ${productId}:`, error);
    throw error;
  }
};

export const getAllVariations = async (
  productId: number,
  params: Record<string, any> = {}
): Promise<any[]> => {
  try {
    const token = await getAccessToken();

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}/variations?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to get variations: ${response.status}`
      );
    }

    const variations = await response.json();
    return variations;
  } catch (error) {
    console.error(`Failed to get variations for product ${productId}:`, error);
    throw error;
  }
};

export const updateVariation = async (
  productId: number,
  variationId: number,
  variationData: Partial<CreateVariationData>
): Promise<any> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(variationData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to update variation: ${response.status}`
      );
    }

    const variation = await response.json();
    return variation;
  } catch (error) {
    console.error(`Failed to update variation ${variationId} for product ${productId}:`, error);
    throw error;
  }
};

export const deleteVariation = async (
  productId: number,
  variationId: number,
  force: boolean = true
): Promise<any> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/${productId}/variations/${variationId}?force=${force}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to delete variation: ${response.status}`
      );
    }

    const variation = await response.json();
    return variation;
  } catch (error) {
    console.error(`Failed to delete variation ${variationId} for product ${productId}:`, error);
    throw error;
  }
};

