/**
 * Custom hook for product form initialization
 * Handles defaultValues computation, vendor fetching, and initial state setup
 * 
 * @param props - Hook props
 * @param props.initialData - Product data for edit mode (null for create mode)
 * @param props.form - React Hook Form instance to initialize
 * 
 * @remarks
 * This hook orchestrates all initialization logic:
 * - Fetches vendor information
 * - Sets initial categories if provided
 * - Expands attributes based on initial data
 * - Fetches and transforms existing variations
 * - Handles form reset with proper default values
 * 
 * All initialization side effects happen here to keep ProductForm component clean.
 * Uses date-parser utilities for safe sale date parsing.
 * 
 * @example
 * ```tsx
 * const form = useForm<FormValues>({ defaultValues: {} });
 * useProductFormInit({ initialData: product, form });
 * ```
 */

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Product } from '@/framework/products/types';
import { FormValues } from '../schema';
import { getAllVariations } from '@/framework/products/get-all-variations';
import { getVendorInfo } from '@/framework/vendor/get-vendor-info';
import { logError } from '@/lib/errors/error-handler';
import { Variation } from '../types';
import { useProductFormStore } from './useProductFormState';
import { parseSaleDate, parseVariationSaleDate, hasSaleDates } from '../utils/date-parser';

interface UseProductFormInitProps {
  initialData: Product | null;
  form: UseFormReturn<FormValues>;
}

/**
 * Computes default values for the product form based on initial data
 * Exported for use in useForm initialization to prevent uncontrolled-to-controlled warnings
 */
export function computeDefaultValues(initialData: Product | null): Partial<FormValues> {
    // Determine product type from API or infer from attributes
    const productType = initialData?.type === 'variable' || initialData?.type === 'simple'
      ? initialData.type
      : (initialData?.attributes && 
          (Array.isArray(initialData.attributes) 
            ? initialData.attributes.length > 0
            : Object.keys(initialData.attributes).length > 0))
      ? 'variable' 
      : 'simple';

    // Check if product is on sale
    const isOnSale = !!(initialData?.sale_price && initialData.sale_price !== '');

    // Get size chart from meta_data - check both ACF and fallback keys
    const sizeChartUrl = initialData?.meta_data?.find(
      (meta) => meta.key === 'size_chart_group' || meta.key === '_size_chart_image'
    )?.value;

    // Ensure sizeChartUrl is a string
    const sizeChartUrlString = typeof sizeChartUrl === 'string' ? sizeChartUrl : '';

    const values = {
      // Use the images array from WooCommerce API (contains src URLs)
      images: initialData?.images
        ?.filter((img) => {
          // Only include images with valid URLs (not just IDs)
          const isValidUrl = img.src && typeof img.src === 'string' && 
            (img.src.startsWith('http://') || img.src.startsWith('https://') || img.src.startsWith('/'));
          return isValidUrl;
        })
        ?.map((img) => 
          ({
            src: img.src,
            id: img.id,
            name: img.name || `image-${img.id}`,
            preview: img.src
          })
        ) || [],
      name: initialData?.name || '',
      type: productType,
      description: initialData?.description || '',
      has_size_chart: !!sizeChartUrlString,
      size_chart: (sizeChartUrlString && 
        (sizeChartUrlString.startsWith('http://') || sizeChartUrlString.startsWith('https://') || sizeChartUrlString.startsWith('/'))) 
        ? [{
          name: 'size-chart',
          preview: sizeChartUrlString,
          src: sizeChartUrlString
        }] : [],
      // Categories - WooCommerce returns 'categories' array with full objects
      categories: initialData?.categories?.map((cat) => ({ id: cat.id })) || 
                  initialData?.category_ids?.map((id) => ({ id })) || [],
      attributes: initialData?.attributes 
        ? Array.isArray(initialData.attributes) 
          ? initialData.attributes.map((attr, index) => ({
              name: attr.name || `Attribute ${index + 1}`,
              position: attr.position ?? index,
              visible: attr.visible !== false,
              variation: attr.variation !== false,
              options: attr.options || []
            }))
          : Object.entries(initialData.attributes as unknown as Record<string, { name?: string; position?: number; visible?: boolean; variation?: boolean; options?: string[] }>).map(([key, attr], index) => ({
              name: attr.name || key,
              position: attr.position ?? index,
              visible: attr.visible !== false,
              variation: attr.variation !== false,
              options: attr.options || []
            }))
      : [],
      default_attributes: Array.isArray(initialData?.default_attributes)
        ? (initialData.default_attributes as unknown) as Array<{ id: number; option: string } | { name: string; option: string }>
        : [],
      price: initialData?.regular_price || initialData?.price || '',
      on_sale: isOnSale,
      sale_price: initialData?.sale_price || '',
      has_sale_dates: hasSaleDates(initialData?.date_on_sale_from, initialData?.date_on_sale_to),
      sale_start_date: parseSaleDate(initialData?.date_on_sale_from, 'sale_start_date'),
      sale_end_date: parseSaleDate(initialData?.date_on_sale_to, 'sale_end_date'),
      stock_status: (initialData?.stock_status === 'instock' || initialData?.stock_status === 'outofstock') 
        ? initialData.stock_status as 'instock' | 'outofstock'
        : 'instock' as const,
      manage_stock: initialData?.manage_stock || false,
      stock_quantity: initialData?.stock_quantity || 0,
      sku: initialData?.sku || '',
      weight: initialData?.weight || '',
      variations: []
    };

    return values;
}

export function useProductFormInit({ initialData, form }: UseProductFormInitProps) {
  const store = useProductFormStore();
  const {
    setVendorId,
    setSelectedCategories,
    setExpandedAttributes,
    setVariations
  } = store;

  // Compute default values using the exported function
  const defaultValues = React.useMemo(() => computeDefaultValues(initialData), [initialData]);

  // Fetch vendor ID
  React.useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const vendorInfo = await getVendorInfo();
        if (vendorInfo?.id) {
          setVendorId(vendorInfo.id);
        }
      } catch (error) {
        logError(error, { action: 'fetch_vendor_info' });
      }
    };
    
    fetchVendorId();
  }, [setVendorId]);

  // Initialize selected categories
  React.useEffect(() => {
    if (initialData?.categories) {
      setSelectedCategories(initialData.categories.map(cat => cat.id));
    } else if (initialData?.category_ids) {
      setSelectedCategories(initialData.category_ids);
    } else {
      // For create mode (initialData is null), ensure categories are empty
      setSelectedCategories([]);
    }
  }, [initialData, setSelectedCategories]);

  // Auto-expand attributes that have existing values
  React.useEffect(() => {
    if (initialData?.attributes) {
      const attributesToExpand = new Set<string>();
      
      // Check each attribute to see if it has options
      const attributesArray = Array.isArray(initialData.attributes)
        ? initialData.attributes
        : Object.entries(initialData.attributes as unknown as Record<string, { name?: string; options?: string[] }>).map(([key, attr]) => ({
            name: attr.name || key,
            options: attr.options
          }));
      
      attributesArray.forEach((attr: { name?: string; options?: string[] }) => {
        const attrName = attr.name || '';
        if (attr.options && attr.options.length > 0) {
          attributesToExpand.add(attrName.toLowerCase());
        }
      });
      
      if (attributesToExpand.size > 0) {
        setExpandedAttributes(attributesToExpand);
      }
    }
  }, [initialData, setExpandedAttributes]);

  // Reset form when initialData changes to sync with computed defaults
  React.useEffect(() => {
    form.reset(defaultValues);
  }, [initialData, defaultValues, form]);

  // Fetch existing variations for variable products
  React.useEffect(() => {
    const fetchVariations = async () => {
      if (!initialData?.id || initialData.type !== 'variable') {
        return;
      }

      try {
        // Add a small delay to ensure any previous cache operations complete
        await new Promise(resolve => setTimeout(resolve, 100));
        const existingVariations = await getAllVariations(initialData.id, {}, { noCache: true });

        // Initialize transformed variations array
        let transformedVariations: Variation[] = [];

        if (existingVariations && existingVariations.length > 0) {
          // Transform API variations to form format
          transformedVariations = existingVariations
            .filter((v: { id?: number }) => v.id) // Only process variations with valid IDs
            .map((v: { 
              id: number; 
              attributes?: Array<{ name?: string; option?: string }>; 
              image?: { src?: string }; 
              regular_price?: string; 
              sale_price?: string; 
              date_on_sale_from?: unknown; 
              date_on_sale_to?: unknown; 
              stock_status?: string; 
              manage_stock?: boolean | string; 
              stock_quantity?: number; 
              sku?: string; 
              weight?: string; 
              status?: string;
            }) => {
            // Extract attributes
            const attributes: Record<string, string> = {};
            if (v.attributes && Array.isArray(v.attributes)) {
              v.attributes.forEach((attr: { name?: string; option?: string }) => {
                const attrName = attr.name || '';
                attributes[attrName] = attr.option || '';
              });
            }

              // Validate variation image URL
              const hasValidImageUrl = v.image?.src && typeof v.image.src === 'string' && 
                (v.image.src.startsWith('http://') || v.image.src.startsWith('https://') || v.image.src.startsWith('/'));
              
              // Debug logging to understand what WooCommerce returns
              if (v.image && (!v.image.src || typeof v.image.src !== 'string')) {
                console.log('Variation has image object but no valid src:', { variationId: v.id, image: v.image });
              }
              
              // Ensure we have a valid ID
              const variationId = v.id || `temp-${Date.now()}-${Math.random()}`;
              
              return {
                id: `var-${variationId}`,
                variation_id: v.id, // Store real WooCommerce variation ID for SKU validation
                attributes,
                // Only set image if it has a valid src URL - otherwise set to null
                image: hasValidImageUrl && v.image?.src ? {
                  name: `variation-${v.id}`,
                  preview: v.image.src,
                  src: v.image.src
                } : null,
                price: v.regular_price || '',
                on_sale: !!(v.sale_price && v.sale_price !== ''),
                sale_price: v.sale_price || '',
                has_sale_dates: !!(v.date_on_sale_from || v.date_on_sale_to),
                sale_start_date: parseVariationSaleDate((typeof v.date_on_sale_from === 'object' && v.date_on_sale_from && 'date' in v.date_on_sale_from ? v.date_on_sale_from.date : v.date_on_sale_from)),
                sale_end_date: parseVariationSaleDate((typeof v.date_on_sale_to === 'object' && v.date_on_sale_to && 'date' in v.date_on_sale_to ? v.date_on_sale_to.date : v.date_on_sale_to)),
                stock_status: (v.stock_status === 'instock' || v.stock_status === 'outofstock')
                  ? v.stock_status
                  : 'instock',
                manage_stock: typeof v.manage_stock === 'boolean' ? v.manage_stock : false,
                stock_quantity: v.stock_quantity || 0,
                sku: v.sku || '',
                weight: v.weight || '',
                enabled: true // All variations from API are enabled
              };
            });
        }

        // Check for disabled variations in meta_data
        if (initialData?.meta_data) {
          try {
            const disabledVariationsMeta = initialData.meta_data.find(
              meta => meta.key === '_disabled_variations'
            );
            
            if (disabledVariationsMeta?.value && typeof disabledVariationsMeta.value === 'string') {
            const disabledVariations = JSON.parse(disabledVariationsMeta.value);
            
            const disabledTransformed = disabledVariations.map((v: {
              id?: string; 
              attributes?: Record<string, unknown>; 
              image?: { src?: string; preview?: string; name?: string }; 
              price?: string; 
              on_sale?: boolean; 
              sale_price?: string; 
              has_sale_dates?: boolean; 
              sale_start_date?: string; 
              sale_end_date?: string; 
              stock_status?: string; 
              manage_stock?: boolean; 
              stock_quantity?: number; 
              sku?: string; 
              weight?: string;
            }) => {
              const attributes: Record<string, string> = {};
              if (v.attributes && typeof v.attributes === 'object') {
                Object.entries(v.attributes).forEach(([key, value]) => {
                  attributes[key] = String(value);
                });
              }
              
              const hasValidImageUrl = v.image?.src && typeof v.image.src === 'string';
              const imageValue = hasValidImageUrl && v.image ? {
                src: v.image.src,
                preview: v.image.preview || v.image.src,
                name: v.image.name || 'variation-image'
              } : null;
              
              return {
                id: v.id || `var-disabled-${Date.now()}-${Math.random()}`,
                variation_id: undefined, // No WooCommerce ID
                attributes: v.attributes || {},
                image: imageValue,
                price: v.price || '',
                on_sale: v.on_sale || false,
                sale_price: v.sale_price || '',
                has_sale_dates: v.has_sale_dates || false,
                sale_start_date: v.sale_start_date || '',
                sale_end_date: v.sale_end_date || '',
                stock_status: (v.stock_status === 'instock' || v.stock_status === 'outofstock')
                  ? v.stock_status
                  : 'instock',
                manage_stock: v.manage_stock || false,
                stock_quantity: v.stock_quantity || 0,
                sku: v.sku || '',
                weight: v.weight || '',
                enabled: false // Always disabled when loaded from meta_data
              };
            });
              
              // Combine enabled (from WooCommerce) and disabled (from meta_data) variations
              const allVariations = [...transformedVariations, ...disabledTransformed];
              setVariations(allVariations);
              form.setValue('variations', allVariations);
            } else {
              // No disabled variations, just use transformed ones
              setVariations(transformedVariations);
              form.setValue('variations', transformedVariations);
            }
          } catch (parseError) {
            logError(parseError, { action: 'parse_disabled_variations' });
          }
        }
      } catch (error) {
        logError(error, { action: 'fetch_variations', productId: initialData?.id });
      }
    };

    fetchVariations();
  }, [initialData, form, setVariations]);

  return { defaultValues };
}

