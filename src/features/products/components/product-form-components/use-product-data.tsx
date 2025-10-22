'use client';

import * as React from 'react';
import { getCategories, ProductCategory } from '@/framework/products/get-categories';
import { getAttributes, ProductAttribute } from '@/framework/products/get-attributes';

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
      } catch (error) {
        console.error('Failed to fetch product data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { categories, attributes, isLoading };
}

