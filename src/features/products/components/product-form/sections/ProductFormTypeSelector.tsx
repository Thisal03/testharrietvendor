/**
 * Product Type Selector Section Component
 * Handles switching between simple and variable product types
 */

'use client';

import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { UseFormReturn } from 'react-hook-form';
import { HelpCircle } from 'lucide-react';
import { ProductTypeSelector } from '../components/ProductTypeSelector';
import { FormValues } from '../schema';

interface ProductFormTypeSelectorProps {
  form: UseFormReturn<FormValues>;
  isUpdateMode: boolean;
}

export function ProductFormTypeSelector({ form, isUpdateMode }: ProductFormTypeSelectorProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-sm'>
          <span className='text-sm font-bold'>2</span>
        </div>
        <div>
          <div className='flex items-center gap-2'>
            <h3 className='text-lg font-semibold'>Product Type</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
              </TooltipTrigger>
              <TooltipContent className='max-w-xs'>
                <p className='text-sm'>
                  <strong>Simple Product:</strong> A single product with one price and no variations.
                  <br /><br />
                  <strong>Variable Product:</strong> A product with multiple variations (like different sizes, colors) with individual prices and inventory.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className='text-xs text-muted-foreground'>Choose between simple or variable product</p>
        </div>
      </div>
      <ProductTypeSelector form={form} isUpdateMode={isUpdateMode} />
    </div>
  );
}

