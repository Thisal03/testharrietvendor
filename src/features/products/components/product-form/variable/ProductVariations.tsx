'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { VariationCard } from './VariationCard';
import { Variation } from '../types';

interface ProductVariationsProps {
  variations: Variation[];
  expandedVariations: Set<string>;
  onToggleExpansion: (variationId: string) => void;
  onUpdateVariation: (index: number, field: string | Record<string, any>, value?: any) => void;
  onGenerateVariations: () => void;
  vendorId?: number;
  productName?: string;
  productId?: number;
}

/**
 * Component for displaying and managing product variations in variable products
 * 
 * Renders a list of VariationCard components for each variation and provides
 * a regenerate button to manually trigger variation generation.
 * 
 * @param props - Component props
 * @param props.variations - Array of product variations to display
 * @param props.expandedVariations - Set of expanded variation IDs
 * @param props.onToggleExpansion - Callback to toggle variation expansion/collapse
 * @param props.onUpdateVariation - Callback to update variation data
 * @param props.onGenerateVariations - Callback to manually regenerate variations
 * @param props.vendorId - Vendor ID for the product
 * @param props.productName - Name of the product (for SKU generation)
 * @param props.productId - Product ID (for edit mode SKU validation)
 * @returns JSX element with variation list and management UI
 */
export function ProductVariations({
  variations,
  expandedVariations,
  onToggleExpansion,
  onUpdateVariation,
  onGenerateVariations,
  vendorId,
  productName,
  productId
}: ProductVariationsProps) {
  return (
    <div className='p-5 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow'>
      {variations.length > 0 ? (
        <div className='flex items-center justify-between mb-5'>
          <p className='text-sm text-muted-foreground'>
            <span className='font-medium text-foreground'>{variations.length}</span> variation{variations.length === 1 ? '' : 's'} • Updates automatically when attributes change
          </p>
          {/* <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onGenerateVariations()}
            className='text-xs'
          >
            Regenerate
          </Button> */}
        </div>
      ) : (
        <div className='flex items-center justify-between mb-5'>
          <p className='text-sm text-muted-foreground'>
            Variations will generate automatically when you add attributes
          </p>
        </div>
      )}

      {variations.length > 0 && (
        <div className='space-y-3'>
            {variations
              .filter((variation) => variation && variation.id) // Filter out invalid variations
              .map((variation, index) => {
                // Ensure variation has an ID, generate one if missing
                const variationId = variation.id || `temp-${Date.now()}-${index}`;
                
                return (
                  <VariationCard
                    key={variationId}
                    variation={variation}
                    isExpanded={expandedVariations.has(variationId)}
                    onToggleExpansion={() => onToggleExpansion(variationId)}
                    onUpdate={(field, value) => onUpdateVariation(index, field, value)}
                    vendorId={vendorId}
                    productName={productName}
                    productId={productId}
                  />
                );
              })}
        </div>
      )}

      {variations.length === 0 && (
        <div className='text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed'>
          <p className='font-medium'>No variations yet</p>
          <p className='text-sm mt-2'>
            Add attributes with &quot;Used for variations&quot; enabled to automatically generate variations
          </p>
        </div>
      )}
    </div>
  );
}

