import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { VariationError } from '@/lib/errors/product-errors';
import { deleteVariation } from './delete-variation';

/**
 * Data structure for creating a product variation in WooCommerce
 * 
 * @interface CreateVariationData
 * @property {string} regular_price - Regular price for the variation (required)
 * @property {string} [sale_price] - Sale price (optional)
 * @property {string} [date_on_sale_from] - Sale start date (ISO 8601)
 * @property {string} [date_on_sale_to] - Sale end date (ISO 8601)
 * @property {number} stock_quantity - Stock quantity (required)
 * @property {string} [sku] - Stock Keeping Unit
 * @property {string} [weight] - Variation weight
 * @property {Array<{id?: number, name?: string, option: string}>} attributes - Variation attributes (required)
 * @property {{id: number} | {src: string}} [image] - Variation image
 * @property {number} [menu_order] - Display order
 * @property {boolean | 'parent'} [manage_stock] - Stock management setting
 * @property {'instock' | 'outofstock' | 'onbackorder'} [stock_status] - Stock status
 * @property {'no' | 'notify' | 'yes'} [backorders] - Backorder setting
 * @property {'taxable' | 'shipping' | 'none'} [tax_status] - Tax status
 * @property {string} [tax_class] - Tax class slug
 * @property {{length?: string, width?: string, height?: string}} [dimensions] - Product dimensions
 * @property {'draft' | 'pending' | 'private' | 'publish'} [status] - Variation status
 * @property {Array<{key: string, value: string | number | boolean | null | Record<string, unknown>}>} [meta_data] - Custom meta data
 * @remarks
 * Used to create individual variations of a variable product in WooCommerce.
 */
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
  menu_order?: number;
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
    value: string | number | boolean | null | Record<string, unknown>;
  }>;
}

/**
 * Creates a single product variation in WooCommerce
 * 
 * @param {number} productId - The parent product ID
 * @param {CreateVariationData} variationData - Variation data including price, stock, attributes, and image
 * @returns {Promise<any>} The created variation object
 * @throws {Error} If variation creation fails
 * 
 * @remarks
 * Creates a single variation for a variable product with specified attributes, pricing, and stock.
 * 
 * @example
 * ```typescript
 * const variation = await createVariation(123, {
 *   regular_price: '29.99',
 *   stock_quantity: 10,
 *   sku: 'VAR-001',
 *   attributes: [{ name: 'Size', option: 'M' }]
 * });
 * ```
 */
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

/**
 * Result structure for batch variation creation
 * 
 * @interface VariationCreationResult
 * @property {any[]} succeeded - Array of successfully created variations
 * @property {Array<{data: CreateVariationData, error: unknown}>} failed - Array of failed variations with their data and error
 * @property {boolean} rolledBack - Whether rollback was performed due to failures
 */
export interface VariationCreationResult {
  succeeded: any[];
  failed: Array<{ data: CreateVariationData; error: unknown }>;
  rolledBack: boolean;
}

/**
 * Creates multiple product variations using parallel individual creation for optimal performance
 * 
 * @param {number} productId - The parent product ID
 * @param {CreateVariationData[]} variations - Array of variation data to create
 * @returns {Promise<VariationCreationResult>} Result containing succeeded, failed, and rollback status
 * @throws {VariationError} If creation fails
 * 
 * @remarks
 * WooCommerce does not support a batch variation creation endpoint. This function uses:
 * - Parallel individual POST requests for all variations
 * - Automatic rollback if any variation fails
 * - Significantly faster than sequential creation
 * - Can create 20+ variations in seconds
 * 
 * @example
 * ```typescript
 * const result = await createMultipleVariations(123, [
 *   { regular_price: '29.99', stock_quantity: 10, attributes: [{ name: 'Size', option: 'S' }] },
 *   { regular_price: '29.99', stock_quantity: 15, attributes: [{ name: 'Size', option: 'M' }] }
 * ]);
 * 
 * console.log(`Created ${result.succeeded.length} variations`);
 * ```
 */
export const createMultipleVariations = async (
  productId: number,
  variations: CreateVariationData[]
): Promise<VariationCreationResult> => {
  // WooCommerce does not support batch variation creation endpoint
  // Use parallel individual creation for optimal performance
  return await createMultipleVariationsParallel(productId, variations);
};

/**
 * Creates multiple variations in parallel with automatic rollback
 * 
 * @internal
 */
async function createMultipleVariationsParallel(
  productId: number,
  variations: CreateVariationData[]
): Promise<VariationCreationResult> {
  const createdVariationIds: number[] = [];

  try {
    // Create all variations in parallel for better performance
    const promises = variations.map((variationData) => 
      createVariation(productId, variationData)
    );
    
    const results = await Promise.allSettled(promises);

    const succeeded = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => {
        createdVariationIds.push(r.value.id);
        return r.value;
      });

    const failed = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r, index) => ({ data: variations[index], error: r.reason }));

    // If any variations failed, rollback all successfully created ones
    if (failed.length > 0) {
      console.warn(
        `${failed.length} variations failed to create. Rolling back ${createdVariationIds.length} successful creations.`
      );

      // Rollback: Delete all successfully created variations
      const deletePromises = createdVariationIds.map((variationId) =>
        deleteVariation(productId, variationId).catch((error) => {
          console.error(`Failed to delete variation ${variationId} during rollback:`, error);
          return null;
        })
      );

      await Promise.all(deletePromises);

      throw new VariationError(
        `Failed to create ${failed.length} of ${variations.length} variations. All variations have been rolled back.`,
        {
          productId,
          variationIds: createdVariationIds,
          succeeded: succeeded.length,
          failed: failed.length,
          metadata: {
            failedVariations: failed.map(f => ({ error: f.error }))
          }
        }
      );
    }

    return {
      succeeded,
      failed: [],
      rolledBack: false
    };
  } catch (error) {
    console.error(`Failed to create variations for product ${productId}:`, error);
    throw error;
  }
}
