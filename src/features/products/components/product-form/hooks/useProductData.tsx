'use client';

import * as React from 'react';
import { getCategories, ProductCategory } from '@/framework/products/get-categories';
import { getAttributes, ProductAttribute } from '@/framework/products/get-attributes';

/**
 * Custom hook for fetching product-related data (categories and attributes)
 * 
 * Fetches categories and attributes from WooCommerce API and manages loading state.
 * Used by ProductForm for dynamic category selection and attribute management.
 * 
 * @returns {Object} Object containing:
 *   - categories: Array of product categories from WooCommerce
 *   - attributes: Array of product attributes available in WooCommerce
 *   - isLoading: Boolean indicating if data is being fetched
 * 
 * @remarks
 * Errors are handled silently to prevent UI disruption. Data is fetched once on mount.
 * 
 * @example
 * ```tsx
 * const { categories, attributes, isLoading } = useProductData();
 * 
 * if (isLoading) return <Spinner />;
 * 
 * return (
 *   <Select>
 *     {categories.map(cat => (
 *       <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
 *     ))}
 *   </Select>
 * );
 * ```
 */
export function useProductData() {
  const [categories, setCategories] = React.useState<ProductCategory[]>([]);
  const [attributes, setAttributes] = React.useState<ProductAttribute[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [categoriesData, attributesData] = await Promise.all([
          getCategories(),
          getAttributes()
        ]);
        setCategories(categoriesData);
        setAttributes(attributesData);
      } catch (_error) {
        // Error handled silently to prevent UI disruption
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { categories, attributes, isLoading };
}

