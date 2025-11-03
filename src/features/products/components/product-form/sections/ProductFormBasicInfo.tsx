/**
 * Basic Information Section Component
 * Handles product name, descriptions, and size chart
 * 
 * @param props - Component props
 * @param props.form - React Hook Form instance
 * @returns JSX element with basic product information form fields
 */

'use client';

import * as React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FloatingLabelInput as Input } from '@/components/ui/floating-input';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ProgressiveImageUploader } from '@/components/progressive-image-uploader';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { UseFormReturn } from 'react-hook-form';
import { HelpCircle } from 'lucide-react';
import { FormValues } from '../schema';

interface ProductFormBasicInfoProps {
  form: UseFormReturn<FormValues>;
}

export function ProductFormBasicInfo({ form }: ProductFormBasicInfoProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-sm'>
          <span className='text-sm font-bold'>1</span>
        </div>
        <div>
          <h3 className='text-lg font-semibold'>Basic Information</h3>
          <p className='text-xs text-muted-foreground'>Product name and description</p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
        {/* Left side - Product Name */}
        <div className='lg:col-span-1'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Enter product name' className='w-full'/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Right side - Size Chart Toggle */}
        <div className='lg:col-span-1 pt-5.5'>
          <div className='space-y-3 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm h-fit'>
            <FormField
              control={form.control}
              name='has_size_chart'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 flex-1'>
                      <FormLabel 
                        htmlFor='has-size-chart'
                        className='cursor-pointer !mt-0 font-medium text-sm'
                      >
                        This product has a size chart
                      </FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className='h-3 w-3 text-muted-foreground cursor-help' />
                        </TooltipTrigger>
                        <TooltipContent className='max-w-xs'>
                          <p className='text-sm'>
                            Enable this if your product needs a size guide (e.g., clothing, shoes, accessories). 
                            You can upload an image showing size measurements or charts to help customers choose the right size.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id='has-size-chart'
                      checked={field.value || false}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          form.setValue('size_chart', []);
                        }
                      }}
                    />
                  </div>
                </FormItem>
              )}
            />

            {form.watch('has_size_chart') && (
              <FormField
                control={form.control}
                name='size_chart'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm'>Size Chart Image</FormLabel>
                    <FormControl>
                      <ProgressiveImageUploader
                        value={field.value as File[]}
                        onValueChange={field.onChange as React.Dispatch<React.SetStateAction<File[]>>}
                        maxFiles={1}
                        maxSize={5 * 1024 * 1024}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Bottom - Long Description (spans full width) */}
        <div className='lg:col-span-2'>
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Description *</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder='Enter detailed product description...'
                    className='min-h-[200px]'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

