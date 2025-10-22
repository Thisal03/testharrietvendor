'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FloatingLabelInput as Input } from '@/components/ui/floating-input';
import { SKUInput } from '@/components/ui/sku-input';
import { ProgressiveImageUploader } from '@/components/progressive-image-uploader';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { UseFormReturn } from 'react-hook-form';
import { HelpCircle, RefreshCw } from 'lucide-react';
import { CategorySelector } from './category-selector';
import { ProductCategory } from '@/framework/products/get-categories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface SimpleProductSettingsProps {
  form: UseFormReturn<any>;
  selectedCategories: number[];
  setSelectedCategories: (categories: number[]) => void;
  dynamicCategories?: ProductCategory[];
  isCategoriesLoading?: boolean;
  onSKUValidationChange?: (isValid: boolean) => void;
  vendorId?: number;
}

export function SimpleProductSettings({
  form,
  selectedCategories,
  setSelectedCategories,
  dynamicCategories,
  isCategoriesLoading = false,
  onSKUValidationChange,
  vendorId
}: SimpleProductSettingsProps) {
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

      {/* Pricing Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-sm'>
            <span className='text-sm font-bold'>4</span>
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg font-semibold'>Pricing</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <p className='text-sm'>
                    <strong>Regular Price:</strong> The standard selling price of your product.
                    <br /><br />
                    <strong>Sale Price:</strong> Optional discounted price. Enable &quot;Put on sale&quot; to set a reduced price.
                    <br /><br />
                    <strong>Sale Dates:</strong> Optional start and end dates for automatic sale activation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className='text-xs text-muted-foreground'>Set your product pricing and discounts</p>
          </div>
        </div>
        
        <div className='p-5 bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow space-y-5'>
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='w-full md:w-1/2'>
                <FormLabel>Regular Price *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type='text' 
                    placeholder='0.00' 
                    inputMode='decimal'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* On Sale Toggle */}
          <FormField
            control={form.control}
            name='on_sale'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-700'>
                  <div className='flex items-center gap-2'>
                    <FormLabel 
                      htmlFor='simple-on-sale'
                      className='cursor-pointer !mt-0'
                    >
                      Put this product on sale
                    </FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className='h-3 w-3 text-muted-foreground cursor-help' />
                      </TooltipTrigger>
                      <TooltipContent className='max-w-xs'>
                        <p className='text-sm'>
                          Enable this to set a discounted sale price for your product. You can also set specific start and end dates for the sale period.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch
                    id='simple-on-sale'
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormItem>
            )}
          />

          {/* Sale Fields - Conditional */}
          {form.watch('on_sale') && (
            <div className='space-y-4 p-4 rounded-lg border bg-gray-50 dark:bg-gray-700'>
              {/* Sale Price */}
              <FormField
                control={form.control}
                name='sale_price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type='text' 
                        placeholder='0.00' 
                        inputMode='decimal'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sale Dates Toggle */}
              <FormField
                control={form.control}
                name='has_sale_dates'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center justify-between p-3 rounded-md bg-white dark:bg-gray-800'>
                      <FormLabel 
                        htmlFor='has-sale-dates'
                        className='cursor-pointer !mt-0'
                      >
                        Set specific sale start and end dates
                      </FormLabel>
                      <Switch
                        id='has-sale-dates'
                        checked={field.value || false}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue('sale_start_date', '');
                            form.setValue('sale_end_date', '');
                          }
                        }}
                      />
                    </div>
                  </FormItem>
                )}
              />

              {/* Sale Date Fields - Conditional */}
              {form.watch('has_sale_dates') && (
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='sale_start_date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Start Date</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type='date'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='sale_end_date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale End Date</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type='date'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-sm'>
            <span className='text-sm font-bold'>5</span>
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-lg font-semibold'>Inventory</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className='h-4 w-4 text-muted-foreground cursor-help' />
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <p className='text-sm'>
                    <strong>Stock Status:</strong> Set to &quot;In Stock&quot; or &quot;Out of Stock&quot; to control availability.
                    <br /><br />
                    <strong>Manage Stock:</strong> Enable to track individual stock quantities and get low stock alerts.
                    <br /><br />
                    <strong>SKU:</strong> Unique identifier for inventory tracking. Must be unique across all products.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className='text-xs text-muted-foreground'>Manage stock levels and product details</p>
          </div>
        </div>
        
        <div className='p-5 bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow space-y-5'>
          {/* Stock Status and Manage Stock Side by Side */}
          <div className='flex items-end gap-3'>
        {/* Stock Status Dropdown */}
        <FormField
          control={form.control}
          name='stock_status'
          render={({ field }) => (
            <FormItem className='w-full md:w-1/6'>
              <FormLabel>Stock Status</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  // If changing to out of stock, set stock quantity to 0 and disable manage stock
                  if (value === 'outofstock') {
                    form.setValue('stock_quantity', 0);
                    form.setValue('manage_stock', false);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select stock status' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='instock'>In Stock</SelectItem>
                  <SelectItem value='outofstock'>Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Manage Stock Toggle - Only show if stock status is "instock" */}
        {form.watch('stock_status') === 'instock' && (
          <FormField
            control={form.control}
            name='manage_stock'
            render={({ field }) => (
              <FormItem className='pb-1'>
                <div className='flex items-center gap-3'>
                  <FormLabel 
                    htmlFor='manage-stock'
                    className='cursor-pointer !mt-0'
                  >
                    Manage stock quantity
                  </FormLabel>
                  <Switch
                    id='manage-stock'
                    checked={field.value || false}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      // If unchecked, reset stock quantity to 0
                      if (!checked) {
                        form.setValue('stock_quantity', 0);
                      }
                    }}
                  />
                </div>
              </FormItem>
            )}
          />
        )}
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {/* Stock Quantity - Only show if manage_stock is checked */}
            {form.watch('manage_stock') && (
              <FormField
                control={form.control}
                name='stock_quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity *</FormLabel>
                    <FormControl>
                      <Input 
                        value={field.value?.toString() || ''} 
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        type='text' 
                        placeholder='0'
                        inputMode='numeric'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name='sku'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center gap-1'>
                    <FormLabel>SKU *</FormLabel>
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
                  <FormControl>
                    <SKUInput 
                      value={field.value || ''}
                      onChange={field.onChange}
                      onValidationChange={onSKUValidationChange}
                      vendorId={vendorId}
                      productName={form.watch('name')}
                      placeholder='Product code'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='weight'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type='text' 
                      placeholder='0.00'
                      inputMode='decimal'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

