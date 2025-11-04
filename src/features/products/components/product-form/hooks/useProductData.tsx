'use client';

import * as React from 'react';
import { ProductCategory } from '@/framework/products/get-categories';
import { ProductAttribute } from '@/framework/products/get-attributes';

/**
 * Custom hook for fetching product-related data (categories and attributes)
 * 
 * Fetches categories and attributes from WooCommerce API via Next.js API routes
 * to avoid CORS issues. Manages loading state.
 * Used by ProductForm for dynamic category selection and attribute management.
 * 
 * @returns {Object} Object containing:
 *   - categories: Array of product categories from WooCommerce
 *   - attributes: Array of product attributes available in WooCommerce
 *   - isLoading: Boolean indicating if data is being fetched
 * 
 * @remarks
 * Errors are handled silently to prevent UI disruption. Data is fetched once on mount.
 * Uses API routes to avoid CORS issues when called from client components.
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
        const [categoriesResponse, attributesResponse] = await Promise.all([
          fetch('/api/products/categories'),
          fetch('/api/products/attributes')
        ]);

        const [categoriesData, attributesData] = await Promise.all([
          categoriesResponse.ok ? categoriesResponse.json() : [],
          attributesResponse.ok ? attributesResponse.json() : []
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

