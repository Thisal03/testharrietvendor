'use client';

import * as React from 'react';
import { FloatingLabelInput as Input } from '@/components/ui/floating-input';
import { SKUInput } from '@/components/ui/sku-input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ProgressiveImageUploader } from '@/components/progressive-image-uploader';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ChevronDown, HelpCircle, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Variation } from './types';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface VariationCardProps {
  variation: Variation;
  index: number;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onUpdate: (field: string | Record<string, any>, value?: any) => void;
  vendorId?: number;
  productName?: string;
}

export function VariationCard({
  variation,
  index,
  isExpanded,
  onToggleExpansion,
  onUpdate,
  vendorId,
  productName
}: VariationCardProps) {
  const imagePreview = React.useMemo(() => {
    if (!variation.image) return null;
    if (variation.image instanceof File && 'preview' in variation.image) {
      return (variation.image as any).preview;
    }
    if (typeof variation.image === 'string') {
      return variation.image;
    }
    if (variation.image && typeof variation.image === 'object' && 'src' in variation.image) {
      return variation.image.src;
    }
    return null;
  }, [variation.image]);

  return (
    <div className='rounded-lg bg-white dark:bg-gray-800 overflow-hidden border shadow-sm hover:shadow-md transition-all'>
      <Collapsible open={isExpanded} onOpenChange={onToggleExpansion}>
        <div className='p-4 flex items-center gap-4 hover:bg-gray-50 dark:bg-gray-700 transition-colors'>
          {/* Variation Image Thumbnail */}
          <div className='flex-shrink-0'>
            {imagePreview ? (
              <div className='relative h-12 w-12 rounded-md overflow-hidden border'>
                <Image
                  src={imagePreview}
                  alt='Variation'
                  fill
                  className='object-cover'
                />
              </div>
            ) : (
              <div className='h-12 w-12 rounded-md border bg-gray-100 flex items-center justify-center'>
                <ImageIcon className='h-5 w-5 text-gray-400' />
              </div>
            )}
          </div>

          <div className='flex items-center justify-between flex-1'>
            <div className='flex items-center gap-3'>
              <h5 className='font-medium'>
                {Object.entries(variation.attributes)
                  .map(([key, val]) => `${key}: ${val}`)
                  .join(' / ')}
              </h5>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-muted-foreground'>Enabled</span>
                <Switch
                  checked={variation.enabled}
                  onCheckedChange={(checked) => {
                    onUpdate('enabled', checked);
                  }}
                />
              </div>
              <CollapsibleTrigger asChild>
                <button className='flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer border border-gray-200'>
                  <span className='text-sm text-muted-foreground'>Details</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 transition-transform duration-200',
                      isExpanded ? 'rotate-180' : ''
                    )}
                  />
                </button>
              </CollapsibleTrigger>
            </div>
          </div>
        </div>
        <CollapsibleContent className='p-4 pt-0 bg-gray-50 dark:bg-gray-700/50'>
          <div className='space-y-4'>
            {/* Variation Image Upload */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium'>Variation Image</label>
              <p className='text-xs text-muted-foreground mb-3'>
                Maximum 1 image per variation
              </p>
              <div className='max-w-xs'>
                <ProgressiveImageUploader
                  value={variation.image ? [variation.image] : []}
                  onValueChange={(files) => {
                    const fileArray = Array.isArray(files) ? files : [];
                    const file = fileArray[0] || null;
                    // Assign preview property if it's a new file
                    if (file && !(file as any).preview) {
                      Object.assign(file, { preview: URL.createObjectURL(file) });
                    }
                    onUpdate('image', file);
                  }}
                  maxFiles={1}
                  maxSize={4 * 1024 * 1024}
                  disabled={!variation.enabled}
                />
              </div>
            </div>

            {/* Fields Grid */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {/* Left Side - Pricing & Sales */}
              <div className='space-y-4'>
                {/* Price */}
                <div>
                  <label className='block text-sm font-medium mb-1'>Price *</label>
                  <Input
                    type='text'
                    inputMode='decimal'
                    value={variation.price}
                    onChange={(e) => onUpdate('price', e.target.value)}
                    placeholder='0.00'
                    className='h-9'
                    disabled={!variation.enabled}
                  />
                </div>

                {/* On Sale Toggle */}
                <div className='flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-700'>
                  <label 
                    htmlFor={`on-sale-${variation.id}`}
                    className={`text-sm font-medium cursor-pointer ${!variation.enabled ? 'opacity-50' : ''}`}
                  >
                    On sale
                  </label>
                  <Switch
                    id={`on-sale-${variation.id}`}
                    checked={variation.on_sale}
                    onCheckedChange={(checked) => {
                      onUpdate('on_sale', checked);
                    }}
                    disabled={!variation.enabled}
                  />
                </div>

                {/* Sale Fields - Conditional */}
                {variation.on_sale && (
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium mb-1'>Sale Price *</label>
                      <Input
                        type='text'
                        inputMode='decimal'
                        value={variation.sale_price}
                        onChange={(e) => onUpdate('sale_price', e.target.value)}
                        placeholder='0.00'
                        className='h-9'
                        disabled={!variation.enabled}
                      />
                    </div>

                    {/* Sale Dates Toggle */}
                    <div className='flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-700'>
                      <label 
                        htmlFor={`has-sale-dates-${variation.id}`}
                        className='text-sm font-medium cursor-pointer'
                      >
                        Set specific sale dates
                      </label>
                      <Switch
                        id={`has-sale-dates-${variation.id}`}
                        checked={variation.has_sale_dates || false}
                        onCheckedChange={(checked) => {
                          onUpdate('has_sale_dates', checked);
                          if (!checked) {
                            onUpdate({
                              has_sale_dates: false,
                              sale_start_date: '',
                              sale_end_date: ''
                            });
                          }
                        }}
                        disabled={!variation.enabled}
                      />
                    </div>

                    {/* Sale Date Fields - Conditional */}
                    {variation.has_sale_dates && (
                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <label className='block text-sm font-medium mb-1'>Start Date</label>
                          <Input
                            type='date'
                            value={variation.sale_start_date}
                            onChange={(e) => onUpdate('sale_start_date', e.target.value)}
                            className='h-9'
                            disabled={!variation.enabled}
                          />
                        </div>

                        <div>
                          <label className='block text-sm font-medium mb-1'>End Date</label>
                          <Input
                            type='date'
                            value={variation.sale_end_date}
                            onChange={(e) => onUpdate('sale_end_date', e.target.value)}
                            className='h-9'
                            disabled={!variation.enabled}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side - Inventory */}
              <div className='space-y-4'>

                {/* Stock Status and Manage Stock */}
                <div>
                  <label className='block text-sm font-medium mb-1'>Stock Status</label>
                  <Select
                    value={variation.stock_status}
                    onValueChange={(value: 'instock' | 'outofstock') => {
                      console.log('Stock status changing to:', value);
                      // If changing to out of stock, update all fields at once
                      if (value === 'outofstock') {
                        onUpdate({
                          stock_status: value,
                          stock_quantity: 0,
                          manage_stock: false
                        });
                      } else {
                        onUpdate('stock_status', value);
                      }
                    }}
                    disabled={!variation.enabled}
                  >
                    <SelectTrigger className='h-9'>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='instock'>In Stock</SelectItem>
                      <SelectItem value='outofstock'>Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Manage Stock Toggle - Only show if stock status is "instock" */}
                {variation.stock_status === 'instock' && (
                  <div className='flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-700'>
                    <label 
                      htmlFor={`manage-stock-${variation.id}`}
                      className='text-sm font-medium cursor-pointer'
                    >
                      Track quantity
                    </label>
                    <Switch
                      id={`manage-stock-${variation.id}`}
                      checked={variation.manage_stock || false}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          onUpdate({
                            manage_stock: false,
                            stock_quantity: 0
                          });
                        } else {
                          onUpdate('manage_stock', true);
                        }
                      }}
                      disabled={!variation.enabled}
                    />
                  </div>
                )}

                {/* Stock Quantity - Only show if manage_stock is checked */}
                {variation.manage_stock && (
                  <div>
                    <label className='block text-sm font-medium mb-1'>Stock Quantity *</label>
                    <Input
                      type='text'
                      inputMode='numeric'
                      value={variation.stock_quantity?.toString() || ''}
                      onChange={(e) => onUpdate('stock_quantity', Number(e.target.value) || 0)}
                      placeholder='0'
                      className='h-9'
                      disabled={!variation.enabled}
                    />
                  </div>
                )}

                  <div>
                    <div className='flex items-center gap-1'>
                      <label className='block text-sm font-medium mb-1'>SKU *</label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                        </TooltipTrigger>
                        <TooltipContent className='max-w-xs'>
                        <p className="text-sm">
                          <strong>SKU:</strong> A unique inventory identifier required for all products. If left blank, one will be auto-generated.
                          <br /><br />
                          Enter a custom SKU or click the <RefreshCw className="size-4 inline-block" /> button to generate one from the product name and your vendor ID.
                        </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <SKUInput
                      value={variation.sku}
                      onChange={(value) => onUpdate('sku', value)}
                      vendorId={vendorId}
                      productName={productName}
                      placeholder='Product code'
                      className='h-9'
                      disabled={!variation.enabled}
                    />
                  </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>Weight (kg)</label>
                  <Input
                    type='text'
                    inputMode='decimal'
                    value={variation.weight}
                    onChange={(e) => onUpdate('weight', e.target.value)}
                    placeholder='0.00'
                    className='h-9'
                    disabled={!variation.enabled}
                  />
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

