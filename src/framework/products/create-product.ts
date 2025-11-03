import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { Product } from './types';
import { ProductCreationError, ProductRollbackError } from '@/lib/errors/product-errors';
import { deleteProduct } from './delete-product';

/**
 * Data structure for creating a product in WooCommerce
 * 
 * @interface CreateProductData
 * @property {string} name - Product name (required)
 * @property {'simple' | 'variable'} type - Product type (required)
 * @property {string} description - Full product description (required)
 * @property {string} short_description - Short description (not used - always empty string)
 * @property {Array<{id: number}>} [categories] - WooCommerce category IDs
 * @property {Array<{id: number}>} [images] - WooCommerce image attachment IDs
 * @property {string | number} [image_id] - Primary product image ID
 * @property {number[]} [gallery_image_ids] - Gallery image IDs
 * @property {Array<{key: string, value: string | number | boolean | null | Record<string, unknown>}>} [meta_data] - Custom meta data for size chart, disabled variations, etc.
 * @property {string} [regular_price] - Regular price for simple products
 * @property {string} [sale_price] - Sale price
 * @property {string} [date_on_sale_from] - Start date for sale (ISO 8601)
 * @property {string} [date_on_sale_to] - End date for sale (ISO 8601)
 * @property {'instock' | 'outofstock'} [stock_status] - Stock status
 * @property {boolean} [manage_stock] - Whether to manage stock
 * @property {number} [stock_quantity] - Stock quantity
 * @property {string} [sku] - Stock Keeping Unit
 * @property {string} [weight] - Product weight
 * @property {Array<{id?: number, name?: string, position: number, visible: boolean, variation: boolean, options: string[]}>} [attributes] - Product attributes for variable products
 * @property {Array<{id?: number, name?: string, option: string}>} [default_attributes] - Default attribute values
 * @property {Array} [variations] - Variation data for variable products
 * @remarks
 * This interface represents the complete data structure for creating products in WooCommerce.
 * It supports both simple and variable products with proper type safety.
 * 
 * @example
 * ```typescript
 * const productData: CreateProductData = {
 *   name: 'Classic T-Shirt',
 *   type: 'variable',
 *   description: 'A classic cotton t-shirt',
 *   short_description: '',
 *   categories: [{ id: 15 }],
 *   images: [{ id: 123 }, { id: 124 }],
 *   attributes: [{
 *     name: 'Size',
 *     position: 0,
 *     visible: true,
 *     variation: true,
 *     options: ['S', 'M', 'L']
 *   }]
 * };
 * ```
 */
export interface CreateProductData {
  name: string;
  type: 'simple' | 'variable';
  description: string;
  short_description: string;
  status?: 'draft' | 'pending' | 'private' | 'publish';
  // WooCommerce standard format for categories
  categories?: Array<{ id: number }>;
  // WooCommerce standard format for images
  images?: Array<{ id: number }>;
  image_id?: string | number;
  gallery_image_ids?: number[];
  // Meta data for size chart and other custom fields
  meta_data?: Array<{
    key: string;
    value: string | number | boolean | null | Record<string, unknown>;
  }>;
  // Simple product fields
  regular_price?: string;
  sale_price?: string;
  date_on_sale_from?: string;
  date_on_sale_to?: string;
  stock_status?: 'instock' | 'outofstock';
  manage_stock?: boolean;
  stock_quantity?: number;
  sku?: string;
  weight?: string;
  // Variable product fields
  attributes?: Array<{
    id?: number;
    name?: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }>;
  default_attributes?: Array<{
    id?: number;
    name?: string;
    option: string;
  }>;
  variations?: Array<{
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
    image?: { src: string };
  }>;
}

/**
 * Creates a new product in WooCommerce with automatic rollback on failure
 * 
 * @param {CreateProductData} productData - Complete product data including basic info, pricing, images, categories, and variations
 * @returns {Promise<Product>} The created product with WooCommerce ID
 * @throws {ProductCreationError} If product creation fails with detailed context
 * @throws {ProductRollbackError} If product was created but rollback fails (critical error)
 * 
 * @remarks
 * This function implements a transaction-like behavior:
 * 1. Attempts to create the product with all data (images, categories, meta_data)
 * 2. Checks if images/categories attached successfully
 * 3. If not attached, attempts an update call to attach them
 * 4. If update fails, deletes the created product (rollback) for data integrity
 * 5. Returns the complete product data or throws descriptive error
 * 
 * The function also optimizes the payload to remove redundant fields and
 * handles WooCommerce API quirks with payload formatting.
 * 
 * @example
 * ```typescript
 * try {
 *   const product = await createProduct({
 *     name: 'New Product',
 *     type: 'simple',
 *     description: 'Product description',
 *     short_description: '',
 *     regular_price: '29.99',
 *     sku: 'PROD-001',
 *     categories: [{ id: 10 }],
 *     images: [{ id: 123 }, { id: 124 }]
 *   });
 *   console.log('Product created:', product.id);
 * } catch (error) {
 *   if (error.isRecoverable()) {
 *     // Retry the operation
 *     error.retry();
 *   }
 * }
 * ```
 */
export const createProduct = async (
  productData: CreateProductData
): Promise<Product> => {
  let createdProductId: number | undefined = undefined;

  try {
    const token = await getAccessToken();

    // Optimize payload: Use categories array format for better WooCommerce compatibility
    const optimizedPayload = { ...productData };
    
    // Ensure categories are in the correct format (array of {id, name} or array of {id})
    if (optimizedPayload.categories && Array.isArray(optimizedPayload.categories)) {
      optimizedPayload.categories = optimizedPayload.categories.map(cat => 
        typeof cat === 'object' && cat.id ? { id: cat.id } : cat
      );
    }

    // Remove duplicate fields that WooCommerce might reject
    if (optimizedPayload.images && optimizedPayload.images.length > 0) {
      // Keep only the images array - remove image_id and gallery_image_ids as they're redundant
      delete (optimizedPayload as any).image_id;
      delete (optimizedPayload as any).gallery_image_ids;
    }

    // Use the correct WooCommerce products endpoint
    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(optimizedPayload)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WooCommerce API Error:', errorData);
      throw new ProductCreationError(
        errorData.message || `Failed to create product: HTTP ${response.status}`,
        {
          productData: optimizedPayload,
          metadata: {
            status: response.status,
            errorData
          }
        }
      );
    }

    const product: Product = await response.json();
    createdProductId = product.id;
    
    // Check if images, categories, or meta_data were provided but not attached
    const hasImages = productData.images?.length || productData.image_id;
    const hasCategories = productData.categories?.length;
    const hasMetaData = productData.meta_data?.length;
    
    const imagesNotAttached = hasImages && (!product.image_id && !product.gallery_image_ids?.length);
    const categoriesNotAttached = hasCategories && !product.category_ids?.length;
    const metaDataNotAttached = hasMetaData && (!product.meta_data || product.meta_data.length === 0);
    
    // Attempt to attach images/categories/meta_data if they failed to attach initially
    if (imagesNotAttached || categoriesNotAttached || metaDataNotAttached) {
      
      const { updateProduct } = await import('./update-product');
      
      // Prepare efficient update payload
      const updatePayload: any = {};
      
      if (imagesNotAttached && productData.images?.length) {
        updatePayload.images = productData.images.map(img => ({ id: img.id }));
      }
      
      if (categoriesNotAttached && productData.categories?.length) {
        updatePayload.categories = productData.categories.map(cat => ({ id: cat.id }));
      }
      
      if (productData.meta_data?.length) {
        updatePayload.meta_data = productData.meta_data;
      }
      
      try {
        const updatedProduct = await updateProduct(product.id, updatePayload);
        return updatedProduct;
      } catch (updateError) {
        // Rollback: Delete the product we just created since we can't attach required data
        console.error('Failed to attach images/categories, rolling back product creation:', updateError);
        
        try {
          await deleteProduct(product.id);
          throw new ProductCreationError(
            `Product created but failed to attach images/categories. The product has been rolled back. Error: ${updateError instanceof Error ? updateError.message : String(updateError)}`,
            {
              productData: optimizedPayload,
              partialProductId: product.id,
              recoverable: true,
              retryAction: () => createProduct(productData),
              metadata: {
                updateError: updateError instanceof Error ? updateError.message : String(updateError),
                attachedImages: !imagesNotAttached,
                attachedCategories: !categoriesNotAttached,
                attachedMetaData: !metaDataNotAttached
              }
            }
          );
        } catch (rollbackError) {
          // If rollback itself fails, we have a serious problem
          throw new ProductRollbackError(
            `Critical error: Product created but rollback failed. Product ID ${product.id} may be orphaned.`,
            product.id,
            {
              cause: updateError,
              metadata: {
                rollbackError: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
                originalError: updateError instanceof Error ? updateError.message : String(updateError)
              }
            }
          );
        }
      }
    }
    
    return product;
  } catch (error) {
    console.error('Failed to create product:', error);
    
    // If product was created but error occurred, ensure cleanup
    if (createdProductId && error instanceof ProductCreationError) {
      // Error already has rollback logic, just rethrow
      throw error;
    }
    
    // For non-ProductCreationError errors, wrap them
    if (!(error instanceof ProductCreationError)) {
      throw new ProductCreationError(
        error instanceof Error ? error.message : 'Failed to create product',
        {
          productData,
          cause: error,
          recoverable: true,
          retryAction: () => createProduct(productData)
        }
      );
    }
    
    throw error;
  }
};

