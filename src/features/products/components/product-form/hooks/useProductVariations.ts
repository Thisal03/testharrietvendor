/**
 * Hook for managing product variations
 * Handles generation, preservation, and updates
 * 
 * @param variations - Array of existing variations to preserve data from
 * @returns Object with generateVariations function
 * 
 * @remarks
 * Generates all possible variation combinations from product attributes
 * while preserving existing variation data when attributes match.
 * 
 * This is used when user modifies attributes and variations need to be
 * regenerated. Existing pricing, inventory, images are preserved.
 * 
 * Uses useRef to avoid callback recreation loops, ensuring images and other
 * variation data are properly preserved when attributes change.
 * 
 * @example
 * ```tsx
 * const { generateVariations } = useProductVariations(existingVariations);
 * 
 * const newVariations = generateVariations(form);
 * ```
 */

import * as React from 'react';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Variation } from '../types';
import { FormValues } from '../schema';

export function useProductVariations(variations: Variation[]) {
  // Use ref to access latest variations without causing callback recreation
  const variationsRef = React.useRef(variations);
  
  // Keep ref in sync with latest variations
  React.useEffect(() => {
    variationsRef.current = variations;
  }, [variations]);

  const generateVariations = useCallback((form: UseFormReturn<FormValues>) => {
    const attributes = form.getValues('attributes') || [];
    
    const variationAttributes = attributes.filter((attr) => attr.variation);
    
    if (variationAttributes.length === 0) {
      return [];
    }

    // Generate all combinations
    const combinations: Variation[] = [];
    const generate = (index: number, current: Record<string, string>) => {
      if (index === variationAttributes.length) {
        // Try to preserve existing variation data if it matches
        // Use ref to get latest variations without causing callback recreation
        const existingVar = variationsRef.current.find(v => {
          if (!v.attributes || Object.keys(v.attributes).length === 0) return false;
          return Object.entries(current).every(([key, val]) => v.attributes && v.attributes[key] === val);
        });

        combinations.push({
          id: existingVar?.id || `var-${Date.now()}-${Math.random()}`,
          attributes: { ...current },
          image: existingVar?.image || null,
          price: existingVar?.price || '',
          on_sale: existingVar?.on_sale || false,
          sale_price: existingVar?.sale_price || '',
          has_sale_dates: existingVar?.has_sale_dates || false,
          sale_start_date: existingVar?.sale_start_date || '',
          sale_end_date: existingVar?.sale_end_date || '',
          stock_status: existingVar?.stock_status || 'instock',
          manage_stock: existingVar?.manage_stock || false,
          stock_quantity: existingVar?.stock_quantity || 0,
          sku: existingVar?.sku || '',
          weight: existingVar?.weight || '',
          enabled: existingVar?.enabled ?? true
        });
        return;
      }

      const attr = variationAttributes[index];
      const attrName = 'name' in attr ? attr.name : '';
      attr.options?.forEach((option) => {
        generate(index + 1, { ...current, [attrName]: option });
      });
    };

    generate(0, {});
    return combinations;
  }, []); // Empty dependency array - use ref instead

  return { generateVariations };
}

