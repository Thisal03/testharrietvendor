'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { VariationCard } from './variation-card';
import { Variation } from './types';

interface ProductVariationsProps {
  variations: Variation[];
  expandedVariations: Set<string>;
  onToggleExpansion: (variationId: string) => void;
  onUpdateVariation: (index: number, field: string | Record<string, any>, value?: any) => void;
  onGenerateVariations: () => void;
  vendorId?: number;
  productName?: string;
}

export function ProductVariations({
  variations,
  expandedVariations,
  onToggleExpansion,
  onUpdateVariation,
  onGenerateVariations,
  vendorId,
  productName
}: ProductVariationsProps) {
  console.log('🎨 ProductVariations rendered with', variations.length, 'variations');
  
  return (
    <div className='p-5 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow'>
      {variations.length > 0 ? (
        <div className='flex items-center justify-between mb-5'>
          <p className='text-sm text-muted-foreground'>
            <span className='font-medium text-foreground'>{variations.length}</span> variation{variations.length === 1 ? '' : 's'} • Updates automatically when attributes change
          </p>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onGenerateVariations()}
            className='text-xs'
          >
            Regenerate
          </Button>
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
            {variations.map((variation, index) => (
              <VariationCard
                key={variation.id}
                variation={variation}
                index={index}
                isExpanded={expandedVariations.has(variation.id)}
                onToggleExpansion={() => onToggleExpansion(variation.id)}
                onUpdate={(field, value) => onUpdateVariation(index, field, value)}
                vendorId={vendorId}
                productName={productName}
              />
            ))}
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

