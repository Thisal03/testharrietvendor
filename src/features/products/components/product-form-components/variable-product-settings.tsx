'use client';

import * as React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { ProgressiveImageUploader } from '@/components/progressive-image-uploader';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { UseFormReturn } from 'react-hook-form';
import { HelpCircle } from 'lucide-react';
import { CategorySelector } from './category-selector';
import { ProductAttributes } from './product-attributes';
import { ProductVariations } from './product-variations';
import { Variation } from './types';
import { ProductCategory } from '@/framework/products/get-categories';

interface VariableProductSettingsProps {
  form: UseFormReturn<any>;
  selectedCategories: number[];
  setSelectedCategories: (categories: number[]) => void;
  dynamicCategories?: ProductCategory[];
  isCategoriesLoading?: boolean;
  expandedAttributes: Set<string>;
  onToggleAttributeExpansion: (attributeName: string) => void;
  onForceUpdate: () => void;
  onAddAttribute: () => void;
  onRemoveAttribute: (index: number) => void;
  onAddOption: (attributeIndex: number) => void;
  onRemoveOption: (attributeIndex: number, optionIndex: number) => void;
  variations: Variation[];
  expandedVariations: Set<string>;
  onToggleVariationExpansion: (variationId: string) => void;
  onUpdateVariation: (index: number, field: string | Record<string, any>, value?: any) => void;
  onGenerateVariations: () => void;
  vendorId?: number;
}

export function VariableProductSettings({
  form,
  selectedCategories,
  setSelectedCategories,
  dynamicCategories,
  isCategoriesLoading = false,
  expandedAttributes,
  onToggleAttributeExpansion,
  onForceUpdate,
  onAddAttribute,
  onRemoveAttribute,
  onAddOption,
  onRemoveOption,
  variations,
  expandedVariations,
  onToggleVariationExpansion,
  onUpdateVariation,
  onGenerateVariations,
  vendorId
}: VariableProductSettingsProps) {
  return (
    <div className='space-y-6'>
      {/* Categories and Images Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-sm'>
            <span className='text-sm font-bold'>3</span>
          </div>
          <div>
            <h3 className='text-lg font-semibold'>Categories & Media</h3>
            <p className='text-xs text-muted-foreground'>Select categories and upload product images</p>
          </div>
        </div>
        
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
          <div className='p-5 bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow'>
            <CategorySelector
              form={form}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              dynamicCategories={dynamicCategories}
              isLoading={isCategoriesLoading}
            />
          </div>

          {/* Images Upload Section */}
          <div className='p-5 bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow'>
            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Product Images *</FormLabel>
                  <p className='text-xs text-muted-foreground mb-3'>
                    First image is the featured image (max 4 images). Drag to reorder.
                  </p>
                  <FormControl>
                    <ProgressiveImageUploader
                      value={field.value}
                      onValueChange={field.onChange}
                      maxFiles={4}
                      maxSize={4 * 1024 * 1024}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Attributes Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-sm'>
            <span className='text-sm font-bold'>4</span>
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg font-semibold'>Attributes</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <p className='text-sm'>
                    <strong>Default Attributes:</strong> Use Size and Color for common variations.
                    <br /><br />
                    <strong>Custom Attributes:</strong> Add up to 3 total attributes (default + custom).
                    <br /><br />
                    <strong>Variations:</strong> Enable &quot;Used for variations&quot; to create different product options with individual pricing and inventory.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className='text-xs text-muted-foreground'>Define size, color, and other attributes</p>
          </div>
        </div>
        
        <ProductAttributes
          form={form}
          expandedAttributes={expandedAttributes}
          onToggleAttributeExpansion={onToggleAttributeExpansion}
          onForceUpdate={onForceUpdate}
          onAddAttribute={onAddAttribute}
          onRemoveAttribute={onRemoveAttribute}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
          onGenerateVariations={onGenerateVariations}
        />
      </div>

      {/* Variations Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-sm'>
            <span className='text-sm font-bold'>5</span>
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg font-semibold'>Product Variations</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <p className='text-sm'>
                    <strong>Auto-Generated:</strong> Variations are automatically created based on your attribute combinations.
                    <br /><br />
                    <strong>Individual Pricing:</strong> Each variation can have its own price, sale price, and inventory.
                    <br /><br />
                    <strong>Variation Images:</strong> Upload specific images for each variation to showcase different options.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className='text-xs text-muted-foreground'>Generate and configure product variations</p>
          </div>
        </div>
        
        <ProductVariations
          variations={variations}
          expandedVariations={expandedVariations}
          onToggleExpansion={onToggleVariationExpansion}
          onUpdateVariation={onUpdateVariation}
          onGenerateVariations={onGenerateVariations}
          vendorId={vendorId}
          productName={form.watch('name')}
        />
      </div>
    </div>
  );
}

