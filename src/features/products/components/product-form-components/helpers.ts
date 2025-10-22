import { FormValues } from './schema';
import { CreateProductData } from '@/framework/products/create-product';
import { UploadedImage } from '@/framework/products/upload-product-image';
import { CreateVariationData } from '@/framework/products/create-variation';

export function transformFormDataToWooCommerce(
  formData: FormValues,
  images: Array<UploadedImage | { src: string }>,
  sizeChartImage?: UploadedImage | { src: string; id?: number }
): CreateProductData {
  // Ensure categories are properly formatted
  console.log('Form categories:', formData.categories);
  
  // Transform categories to proper WooCommerce format
  const categories = formData.categories && Array.isArray(formData.categories) && formData.categories.length > 0
    ? formData.categories.map(cat => cat.id).filter(id => id && typeof id === 'number')
    : [];
  console.log('Transformed categories (as integer array):', categories);

  // Validate that we have at least one valid category
  if (categories.length === 0) {
    console.warn('No valid categories provided. At least one category is required.');
  }

  // Transform images to WooCommerce format - ensure proper structure
  const transformedImages = images.map((img) => {
    if ('id' in img && img.id) {
      console.log('Processing uploaded image with ID:', img.id, 'and src:', img.src);
      // WooCommerce expects { id: number } format for images
      return { 
        id: img.id
      };
    }
    // For existing images, we need to handle them differently
    console.log('Processing existing image with src:', img.src);
    return { src: img.src };
  });

  console.log('Transformed images for WooCommerce:', transformedImages);

  // Extract image IDs for proper attachment
  const imageIds = images
    .filter(img => 'id' in img && img.id)
    .map(img => ('id' in img ? img.id : 0))
    .filter(id => id > 0);

  console.log('Extracted image IDs:', imageIds);

  // Prepare meta_data array
  const metaData: Array<{ key: string; value: any }> = [];

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

  const baseData: CreateProductData = {
    name: formData.name,
    type: formData.type as 'simple' | 'variable',
    description: formData.description,
    short_description: formData.short_description,
    // Use WooCommerce categories format - array of objects with id property
    categories: categories.map(id => ({ id })),
    // Use proper WooCommerce format for images - only send { id: number } format
    images: transformedImages.filter(img => 'id' in img && img.id).map(img => ({ id: img.id! })),
    // Set featured image (first image)
    image_id: imageIds.length > 0 ? imageIds[0].toString() : undefined,
    // Set gallery images (remaining images)
    gallery_image_ids: imageIds.length > 1 ? imageIds.slice(1) : [],
    // Include meta_data
    meta_data: metaData.length > 0 ? metaData : undefined
  };

  console.log('Final product data - Images section:', {
    images: baseData.images,
    image_id: baseData.image_id,
    gallery_image_ids: baseData.gallery_image_ids
  });
  console.log('Final product data - Categories section:', {
    categories: baseData.categories
  });
  console.log('Final product data - Meta data section:', {
    meta_data: baseData.meta_data
  });

  if (formData.type === 'simple') {
    // Simple product
    return {
      ...baseData,
      regular_price: formData.price,
      sale_price: formData.on_sale && formData.sale_price ? formData.sale_price : undefined,
      date_on_sale_from: formData.on_sale && formData.has_sale_dates && formData.sale_start_date ? formData.sale_start_date : undefined,
      date_on_sale_to: formData.on_sale && formData.has_sale_dates && formData.sale_end_date ? formData.sale_end_date : undefined,
      stock_status: formData.stock_status,
      manage_stock: formData.manage_stock,
      stock_quantity: formData.manage_stock ? formData.stock_quantity : 0,
      sku: formData.sku,
      weight: formData.weight
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
            options: attr.options
          };
        } else {
          return {
            name: 'name' in attr ? attr.name : `Attribute ${index}`,
            position: attr.position,
            visible: attr.visible,
            variation: attr.variation,
            options: attr.options
          };
        }
      }),
      default_attributes: formData.default_attributes
    };
  }
}

export function transformVariationsData(
  formData: FormValues,
  uploadedVariationImages: Map<string, UploadedImage>
): CreateVariationData[] {
  if (formData.type !== 'variable' || !formData.variations) {
    return [];
  }

  return formData.variations
    .filter((v) => v.enabled)
    .map((variation) => {
      // Convert attributes object to WooCommerce format
      const attributes = Object.entries(variation.attributes).map(([name, option]) => ({
        name,
        option
      }));

      const variationData: CreateVariationData = {
        regular_price: variation.price,
        sale_price: variation.on_sale && variation.sale_price ? variation.sale_price : undefined,
        date_on_sale_from: variation.on_sale && variation.has_sale_dates && variation.sale_start_date ? variation.sale_start_date : undefined,
        date_on_sale_to: variation.on_sale && variation.has_sale_dates && variation.sale_end_date ? variation.sale_end_date : undefined,
        stock_quantity: variation.stock_quantity,
        sku: variation.sku || undefined,
        weight: variation.weight || undefined,
        attributes,
        // Add WooCommerce-specific fields for better compatibility
        manage_stock: variation.manage_stock ? true : 'parent',
        stock_status: variation.stock_status || 'instock',
        backorders: 'no', // Default to no backorders
        tax_status: 'taxable', // Default to taxable
        status: 'publish' // Default to published
      };

      // Add image if uploaded
      if (uploadedVariationImages.has(variation.id)) {
        const uploadedImage = uploadedVariationImages.get(variation.id)!;
        variationData.image = { id: uploadedImage.id };
      }

      return variationData;
    });
}

export function prepareImageUploads(formData: FormValues): {
  mainImages: File[];
  existingImages: { src: string }[];
  sizeChart: File | null;
  existingSizeChart: string | null;
  variationImages: Map<string, File>;
} {
  const mainImages: File[] = [];
  const existingImages: { src: string }[] = [];
  const variationImages = new Map<string, File>();

  // Get main product images - separate new uploads from existing URLs
  if (formData.images && Array.isArray(formData.images)) {
    formData.images.forEach((img: any) => {
      if (img instanceof File) {
        mainImages.push(img);
      } else if (img && img.src) {
        // Existing image URL from backend
        existingImages.push({ src: img.src });
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

