/**
 * Transform helper utilities for product form
 * Converts form data to WooCommerce API format
 */

import { FormValues } from '../schema';
import { CreateProductData } from '@/framework/products/create-product';
import { UploadedImage } from '@/framework/products/upload-product-image';
import { CreateVariationData } from '@/framework/products/create-variation';
import { FormFile, VariationImage } from '../types';
import { sanitizeText, sanitizeHTML, sanitizeNumber } from '@/lib/sanitization';

/**
 * Transform form data to WooCommerce product format
 * 
 * @param formData - Product form values
 * @param images - Uploaded product images
 * @param sizeChartImage - Optional size chart image
 * @param uploadedVariationImages - Map of uploaded variation images by variation ID (optional)
 * @param status - Product status: 'draft', 'pending', or 'publish' (optional, defaults to 'pending')
 * @returns WooCommerce product data ready for API submission
 */
export function transformFormDataToWooCommerce(
  formData: FormValues,
  images: Array<UploadedImage | { src: string }>,
  sizeChartImage?: UploadedImage | { src: string; id?: number },
  uploadedVariationImages?: Map<string, UploadedImage>,
  status: 'draft' | 'pending' | 'publish' = 'pending'
): CreateProductData {
  // Transform categories to proper WooCommerce format
  const categories = formData.categories && Array.isArray(formData.categories) && formData.categories.length > 0
    ? formData.categories.map(cat => cat.id).filter(id => id && typeof id === 'number')
    : [];

  // Transform images to WooCommerce format - ensure proper structure
  const transformedImages = images.map((img) => {
    if ('id' in img && img.id) {
      // WooCommerce expects { id: number } format for images
      return { 
        id: img.id
      };
    }
    // For existing images, we need to handle them differently
    return { src: img.src };
  });

  // Extract image IDs for proper attachment
  const imageIds = images
    .filter(img => 'id' in img && img.id)
    .map(img => ('id' in img ? img.id : 0))
    .filter(id => id > 0);

  // Prepare meta_data array
  const metaData: Array<{ key: string; value: string | number | boolean | null | Record<string, unknown> }> = [];

  // Add size chart to meta_data if provided
  if (sizeChartImage) {
    // ACF field format for size_chart_group - use attachment ID
    if ('id' in sizeChartImage && sizeChartImage.id) {
      // Send the attachment ID for ACF to process
      metaData.push({
        key: 'size_chart_group',
        value: sizeChartImage.id
      });
    }
    
    // Fallback format for other plugins that might expect URL
    metaData.push({
      key: '_size_chart_image',
      value: sizeChartImage.src
    });
  }

  // Store disabled variations in meta_data for variable products
  if (formData.type === 'variable' && formData.variations && formData.variations.length > 0) {
    const disabledVariations = formData.variations
      .filter(v => !v.enabled)
      .map(v => {
        // Handle image: if it's a File that was uploaded, use the uploaded image URL
        let imageValue = null;
        if (v.image) {
          if (v.image instanceof File) {
            // File was uploaded - use the uploaded image URL from uploadedVariationImages
            const uploadedImg = uploadedVariationImages?.get(v.id);
            if (uploadedImg && uploadedImg.src) {
              imageValue = {
                src: uploadedImg.src,
                preview: uploadedImg.src,
                name: uploadedImg.name || 'variation-image'
              };
            }
          } else if (typeof v.image === 'string') {
            // String URL
            imageValue = {
              src: v.image,
              preview: v.image,
              name: 'variation-image'
            };
          } else if (v.image && typeof v.image === 'object' && 'src' in v.image) {
            // VariationImage object with src
            imageValue = {
              src: (v.image as VariationImage & { src: string }).src,
              preview: (v.image as VariationImage & { preview?: string }).preview || (v.image as VariationImage & { src: string }).src,
              name: (v.image as VariationImage & { name?: string }).name || 'variation-image'
            };
          }
        }
        
        return {
          id: v.id,
          attributes: v.attributes || {},
          image: imageValue,
          price: v.price,
          on_sale: v.on_sale,
          sale_price: v.sale_price,
          has_sale_dates: v.has_sale_dates,
          sale_start_date: v.sale_start_date,
          sale_end_date: v.sale_end_date,
          stock_status: v.stock_status,
          manage_stock: v.manage_stock,
          stock_quantity: v.stock_quantity,
          sku: v.sku,
          weight: v.weight
        };
      });
    
    if (disabledVariations.length > 0) {
      metaData.push({
        key: '_disabled_variations',
        value: JSON.stringify(disabledVariations)
      });
    }
  }

  const baseData: CreateProductData = {
    name: sanitizeText(formData.name),
    type: formData.type as 'simple' | 'variable',
    description: sanitizeHTML(formData.description),
    short_description: '', // Not used - always send empty string
    // Use WooCommerce categories format - array of objects with id property
    categories: categories.map(id => ({ id })),
    // Use proper WooCommerce format for images - only send { id: number } format
    images: transformedImages.filter(img => 'id' in img && img.id).map(img => ({ id: img.id! })),
    // Set featured image (first image)
    image_id: imageIds.length > 0 ? imageIds[0].toString() : undefined,
    // Set gallery images (remaining images)
    gallery_image_ids: imageIds.length > 1 ? imageIds.slice(1) : [],
    // Include meta_data
    meta_data: metaData.length > 0 ? metaData : undefined,
    // Set product status
    status
  };

  if (formData.type === 'simple') {
    // Simple product
    // WooCommerce stock logic: if stock_status is 'outofstock', manage_stock should be false
    const isOutOfStock = formData.stock_status === 'outofstock';
    
    // Sale logic: if on_sale is false, explicitly clear all sale-related fields
    const isOnSale = formData.on_sale === true;
    
    return {
      ...baseData,
      regular_price: sanitizeNumber(formData.price || ''),
      // When not on sale, explicitly set empty string to clear WooCommerce sale fields
      sale_price: isOnSale && formData.sale_price ? sanitizeNumber(formData.sale_price) : '',
      // When not on sale, explicitly clear sale dates
      date_on_sale_from: isOnSale && formData.has_sale_dates && formData.sale_start_date ? formData.sale_start_date : '',
      date_on_sale_to: isOnSale && formData.has_sale_dates && formData.sale_end_date ? formData.sale_end_date : '',
      stock_status: formData.stock_status,
      // If out of stock, force manage_stock to false, otherwise use form value
      manage_stock: isOutOfStock ? false : formData.manage_stock,
      // If out of stock, set quantity to 0, otherwise use form value if managing stock
      stock_quantity: isOutOfStock ? 0 : (formData.manage_stock ? formData.stock_quantity : 0),
      sku: formData.sku ? sanitizeText(formData.sku) : undefined,
      weight: formData.weight ? sanitizeNumber(formData.weight) : undefined
    };
  } else {
    // Variable product - attributes only (variations created separately)
    return {
      ...baseData,
      attributes: formData.attributes?.map((attr, index) => {
        // WooCommerce expects either id or name, not both
        if ('id' in attr) {
          return {
            id: attr.id,
            position: attr.position,
            visible: attr.visible,
            variation: attr.variation,
            options: attr.options.map(opt => sanitizeText(opt))
          };
        } else {
          return {
            name: 'name' in attr ? sanitizeText(attr.name) : `Attribute ${index}`,
            position: attr.position,
            visible: attr.visible,
            variation: attr.variation,
            options: attr.options.map(opt => sanitizeText(opt))
          };
        }
      }),
      default_attributes: formData.default_attributes?.map(attr => ({
        ...attr,
        option: sanitizeText(attr.option)
      }))
    };
  }
}

/**
 * Transform variation form data to WooCommerce format
 * 
 * @param formData - Product form values
 * @param uploadedVariationImages - Map of uploaded variation images by variation ID
 * @returns Array of variation data ready for WooCommerce API
 */
export function transformVariationsData(
  formData: FormValues,
  uploadedVariationImages: Map<string, UploadedImage>
): CreateVariationData[] {
  if (formData.type !== 'variable' || !formData.variations) {
    return [];
  }

  // Only include ENABLED variations for WooCommerce
  // Disabled variations will be deleted from WooCommerce
  const sortedVariations = [...formData.variations]
    .filter((v) => v.enabled) // ONLY ENABLED VARIATIONS
    .sort((a, b) => {
      // Check if variation is on sale
      const aIsOnSale = a.on_sale && a.sale_price;
      const bIsOnSale = b.on_sale && b.sale_price;
      
      // Sales variations come first
      if (aIsOnSale && !bIsOnSale) return -1;
      if (!aIsOnSale && bIsOnSale) return 1;
      
      // If both or neither are on sale, maintain original order
      return 0;
    });

  return sortedVariations
    .map((variation, index) => {
      // Convert attributes object to WooCommerce format
      // Handle case where attributes might be undefined
      const variationAttributes = variation.attributes || {};
      const attributes = Object.entries(variationAttributes).map(([name, option]) => ({
        name: sanitizeText(name),
        option: sanitizeText(option)
      }));

      // WooCommerce stock logic: if stock_status is 'outofstock', manage_stock should be false
      const isOutOfStock = variation.stock_status === 'outofstock';
      
      // Sale logic: if on_sale is false, explicitly clear all sale-related fields
      const isVariationOnSale = variation.on_sale === true;

      const variationData: CreateVariationData = {
        regular_price: sanitizeNumber(variation.price || '0'), // Default to 0 if no price (for disabled variations)
        // When not on sale, explicitly set empty string to clear WooCommerce sale fields
        sale_price: isVariationOnSale && variation.sale_price ? sanitizeNumber(variation.sale_price) : '',
        // When not on sale, explicitly clear sale dates
        date_on_sale_from: isVariationOnSale && variation.has_sale_dates && variation.sale_start_date ? variation.sale_start_date : '',
        date_on_sale_to: isVariationOnSale && variation.has_sale_dates && variation.sale_end_date ? variation.sale_end_date : '',
        // If out of stock, set quantity to 0, otherwise use variation value
        stock_quantity: isOutOfStock ? 0 : variation.stock_quantity,
        sku: variation.sku ? sanitizeText(variation.sku) : undefined,
        weight: variation.weight ? sanitizeNumber(variation.weight) : undefined,
        menu_order: index, // Use index for menu order (0, 1, 2, ...) - sales variations will be 0, 1, etc.
        attributes,
        // Add WooCommerce-specific fields for better compatibility
        // If out of stock, force manage_stock to false (or 'parent'), otherwise use variation value
        manage_stock: isOutOfStock ? false : (variation.manage_stock ? true : 'parent'),
        stock_status: variation.stock_status || 'instock',
        backorders: 'no', // Default to no backorders
        tax_status: 'taxable' // Default to taxable
        // Note: WooCommerce variations don't support status field
        // We only send enabled variations, disabled ones are deleted from WooCommerce
      };

      // Add image if uploaded or exists
      if (uploadedVariationImages.has(variation.id)) {
        // New uploaded image
        const uploadedImage = uploadedVariationImages.get(variation.id)!;
        variationData.image = { id: uploadedImage.id };
      } else if (variation.image) {
        // Existing image from backend - extract ID or src
        if (typeof variation.image === 'string') {
          // String URL - cannot preserve, skip
        } else if (variation.image && typeof variation.image === 'object' && 'src' in variation.image) {
          // Object with src - check if it has an id
          const imgObj = variation.image as any;
          if (imgObj.id) {
            variationData.image = { id: imgObj.id };
          } else if (imgObj.src) {
            // Only src URL - cannot preserve WooCommerce ID, skip to clear it
          }
        }
      }
      // If no image conditions met above, variationData.image stays undefined
      // WooCommerce will keep existing image if update doesn't specify image field
      // To clear image, we need to explicitly send null

      return variationData;
    });
}

/**
 * Prepare images for upload by separating new uploads from existing images
 * 
 * @param formData - Product form values
 * @returns Object with separated images: new uploads, existing images, size chart, and variation images
 */
export function prepareImageUploads(formData: FormValues): {
  mainImages: File[];
  existingImages: { src: string; id?: number }[];
  sizeChart: File | null;
  existingSizeChart: string | null;
  variationImages: Map<string, File>;
} {
  const mainImages: File[] = [];
  const existingImages: { src: string; id?: number }[] = [];
  const variationImages = new Map<string, File>();

  // Get main product images - separate new uploads from existing URLs
  if (formData.images && Array.isArray(formData.images)) {
    formData.images.forEach((img: FormFile) => {
      if (img instanceof File) {
        mainImages.push(img);
      } else if (img && typeof img === 'object' && 'src' in img) {
        // Existing image URL from backend - keep both src and id
        existingImages.push({ 
          src: img.src,
          id: img.id // Preserve the image ID so WooCommerce knows which images to keep
        });
      }
    });
  }

  // Get size chart - separate new upload from existing URL
  let sizeChart: File | null = null;
  let existingSizeChart: string | null = null;
  if (formData.size_chart) {
    const sizeChartArray = Array.isArray(formData.size_chart)
      ? formData.size_chart
      : [formData.size_chart];
    if (sizeChartArray[0] instanceof File) {
      sizeChart = sizeChartArray[0];
    } else if (sizeChartArray[0] && sizeChartArray[0].src) {
      existingSizeChart = sizeChartArray[0].src;
    }
  }

  // Get variation images
  if (formData.type === 'variable' && formData.variations) {
    formData.variations.forEach((variation) => {
      if (variation.image instanceof File) {
        variationImages.set(variation.id, variation.image);
      }
    });
  }

  return { mainImages, existingImages, sizeChart, existingSizeChart, variationImages };
}

