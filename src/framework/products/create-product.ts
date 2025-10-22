import { getAccessToken } from '@/lib/services/token';
import { config } from '../config';
import { Product } from './types';

export interface CreateProductData {
  name: string;
  type: 'simple' | 'variable';
  description: string;
  short_description: string;
  // WooCommerce standard format for categories
  categories?: Array<{ id: number }>;
  // WooCommerce standard format for images
  images?: Array<{ id: number }>;
  image_id?: string | number;
  gallery_image_ids?: number[];
  // Meta data for size chart and other custom fields
  meta_data?: Array<{
    key: string;
    value: any;
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

export const createProduct = async (
  productData: CreateProductData
): Promise<Product> => {
  try {
    const token = await getAccessToken();

    // Log the data being sent for debugging
    console.log('Creating product with data:', JSON.stringify(productData, null, 2));
    console.log('Image fields being sent:', {
      images: productData.images,
      image_id: productData.image_id,
      gallery_image_ids: productData.gallery_image_ids
    });
    console.log('Category fields being sent:', {
      categories: productData.categories
    });
    console.log('Meta data being sent:', {
      meta_data: productData.meta_data
    });

    // Use the correct WooCommerce products endpoint
    const response = await fetch(
      `${config.WORDPRESS_SITE_URL}/wp-json/wc/v3/products`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WooCommerce API Error:', errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const product: Product = await response.json();
    
    // Log the response to verify image and category attachment
    console.log('Product created - API Response:', {
      id: product.id,
      name: product.name,
      image_id: product.image_id,
      gallery_image_ids: product.gallery_image_ids,
      featured_image: product.featured_image,
      category_ids: product.category_ids
    });
    
    // Check if images, categories, or meta_data were provided but not attached
    const hasImages = productData.images?.length || productData.image_id;
    const hasCategories = productData.categories?.length;
    const hasMetaData = productData.meta_data?.length;
    
    const imagesNotAttached = hasImages && (!product.image_id && !product.gallery_image_ids?.length);
    const categoriesNotAttached = hasCategories && !product.category_ids?.length;
    const metaDataNotAttached = hasMetaData && (!product.meta_data || product.meta_data.length === 0);
    
    console.log('Attachment check:', {
      hasImages,
      hasCategories,
      hasMetaData,
      imagesNotAttached,
      categoriesNotAttached,
      metaDataNotAttached,
      productImageId: product.image_id,
      productGalleryIds: product.gallery_image_ids,
      productCategoryIds: product.category_ids,
      productMetaData: product.meta_data?.length
    });
    
    if (imagesNotAttached || categoriesNotAttached || metaDataNotAttached) {
      console.log('🔄 Some data not attached, updating product...');
      
      // Import updateProduct function
      const { updateProduct } = await import('./update-product');
      
      // Prepare update payload with correct format
      const updatePayload: any = {};
      
      if (imagesNotAttached && productData.images?.length) {
        updatePayload.images = productData.images.map(img => ({ id: img.id }));
        updatePayload.image_id = productData.image_id;
        updatePayload.gallery_image_ids = productData.gallery_image_ids;
        console.log('📸 Updating with images:', updatePayload.images);
      }
      
      if (categoriesNotAttached && productData.categories?.length) {
        // Use the categories format that WooCommerce expects
        updatePayload.categories = productData.categories;
        console.log('🏷️ Updating with categories:', updatePayload.categories);
      }
      
      // Always include meta_data in update to ensure size chart is properly attached
      if (productData.meta_data?.length) {
        updatePayload.meta_data = productData.meta_data;
        console.log('📋 Updating with meta_data:', updatePayload.meta_data);
      }
      
      try {
        // Update the product with missing data
        const updatedProduct = await updateProduct(product.id, updatePayload);
        
        // Fetch the product again to get actual saved state
        const { getProductById } = await import('./get-product-by-id');
        const verifiedProduct = await getProductById(product.id);
        
        if (verifiedProduct) {
          console.log('✅ Product verified after update:', {
            id: verifiedProduct.id,
            image_id: verifiedProduct.image_id,
            gallery_image_ids: verifiedProduct.gallery_image_ids,
            category_ids: verifiedProduct.category_ids,
            meta_data: verifiedProduct.meta_data?.filter(m => m.key.includes('size_chart'))
          });
          
          // Check if the update actually worked
          const imagesStillMissing = imagesNotAttached && (!verifiedProduct.image_id && !verifiedProduct.gallery_image_ids?.length);
          const categoriesStillMissing = categoriesNotAttached && !verifiedProduct.category_ids?.length;
          const metaDataStillMissing = metaDataNotAttached && (!verifiedProduct.meta_data || verifiedProduct.meta_data.length === 0);
          
          if (imagesStillMissing || categoriesStillMissing || metaDataStillMissing) {
            console.warn('⚠️ Some data still not attached after update, trying fallback approach...');
            
            // Try a more direct approach for categories
            if (categoriesStillMissing && productData.categories?.length) {
              console.log('🔄 Trying direct category assignment...');
              try {
                const categoryUpdatePayload = {
                  categories: productData.categories
                };
                await updateProduct(product.id, categoryUpdatePayload);
                console.log('✅ Categories updated with direct approach');
              } catch (categoryError) {
                console.error('❌ Direct category update failed:', categoryError);
              }
            }
          }
          
          return verifiedProduct;
        }
        
        console.log('✅ Product updated successfully:', {
          id: updatedProduct.id,
          image_id: updatedProduct.image_id,
          gallery_image_ids: updatedProduct.gallery_image_ids,
          category_ids: updatedProduct.category_ids,
          meta_data_keys: updatedProduct.meta_data?.map(m => m.key) || []
        });
        
        return updatedProduct;
      } catch (updateError) {
        console.error('❌ Failed to update product:', updateError);
        // Return the original product even if update fails
        return product;
      }
    }
    
    return product;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
};

