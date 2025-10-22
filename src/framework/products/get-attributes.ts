import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: string;
  order_by: string;
  has_archives: boolean;
  _links?: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
  };
}

export interface CreateAttributeData {
  name: string;
  slug: string;
  type?: string;
  order_by?: string;
  has_archives?: boolean;
}

export interface UpdateAttributeData {
  name?: string;
  slug?: string;
  type?: string;
  order_by?: string;
  has_archives?: boolean;
}

export const getAttributes = async (): Promise<ProductAttribute[]> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/attributes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        next: {
          revalidate: 3600 // Cache for 1 hour
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const attributes: ProductAttribute[] = await response.json();
    return attributes;
  } catch (error) {
    console.error('Failed to fetch attributes:', error);
    return [];
  }
};

export const getAttributeTerms = async (
  attributeId: number
): Promise<{ id: number; name: string; slug: string }[]> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/attributes/${attributeId}/terms?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        next: {
          revalidate: 3600 // Cache for 1 hour
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const terms = await response.json();
    return terms;
  } catch (error) {
    console.error(`Failed to fetch attribute terms for ${attributeId}:`, error);
    return [];
  }
};

export const getAttribute = async (attributeId: number): Promise<ProductAttribute | null> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/attributes/${attributeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        next: {
          revalidate: 3600 // Cache for 1 hour
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Attribute with ID ${attributeId} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const attribute: ProductAttribute = await response.json();
    return attribute;
  } catch (error) {
    console.error(`Failed to fetch attribute ${attributeId}:`, error);
    return null;
  }
};

export const createAttribute = async (attributeData: CreateAttributeData): Promise<ProductAttribute> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/attributes`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attributeData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to create attribute: ${response.status}`
      );
    }

    const attribute: ProductAttribute = await response.json();
    return attribute;
  } catch (error) {
    console.error('Failed to create attribute:', error);
    throw error;
  }
};

export const updateAttribute = async (
  attributeId: number,
  attributeData: UpdateAttributeData
): Promise<ProductAttribute> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/attributes/${attributeId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attributeData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to update attribute: ${response.status}`
      );
    }

    const attribute: ProductAttribute = await response.json();
    return attribute;
  } catch (error) {
    console.error(`Failed to update attribute ${attributeId}:`, error);
    throw error;
  }
};

export const deleteAttribute = async (
  attributeId: number,
  force: boolean = true
): Promise<ProductAttribute> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products/attributes/${attributeId}?force=${force}`,
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
        errorData.message || `Failed to delete attribute: ${response.status}`
      );
    }

    const attribute: ProductAttribute = await response.json();
    return attribute;
  } catch (error) {
    console.error(`Failed to delete attribute ${attributeId}:`, error);
    throw error;
  }
};

