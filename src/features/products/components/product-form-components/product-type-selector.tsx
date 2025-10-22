'use client';

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';

interface ProductTypeSelectorProps {
  form: UseFormReturn<any>;
}

export function ProductTypeSelector({ form }: ProductTypeSelectorProps) {
  return (
    <FormField
      control={form.control}
      name='type'
      render={({ field }) => (
        <FormItem>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 pt-2'>
            <div
              className={`p-5 border-2 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md ${
                field.value === 'simple'
                  ? 'border-yellow-500 bg-yellow-500/5 dark:bg-yellow-500/10 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
              }`}
              onClick={() => field.onChange('simple')}
            >
              <div className='flex items-start space-x-3'>
                <div className={`w-5 h-5 rounded-full border-2 mt-1 flex-shrink-0 flex items-center justify-center ${
                  field.value === 'simple'
                    ? 'border-yellow-500 bg-yellow-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {field.value === 'simple' && (
                    <div className='w-2.5 h-2.5 bg-white rounded-full'></div>
                  )}
                </div>
                <div>
                  <h3 className='font-semibold text-base mb-1'>Simple Product</h3>
                  <p className='text-sm text-muted-foreground'>A standard product with a single SKU and fixed price</p>
                </div>
              </div>
            </div>
            
            <div
              className={`p-5 border-2 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md ${
                field.value === 'variable'
                  ? 'border-yellow-500 bg-yellow-500/5 dark:bg-yellow-500/10 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
              }`}
              onClick={() => field.onChange('variable')}
            >
              <div className='flex items-start space-x-3'>
                <div className={`w-5 h-5 rounded-full border-2 mt-1 flex-shrink-0 flex items-center justify-center ${
                  field.value === 'variable'
                    ? 'border-yellow-500 bg-yellow-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {field.value === 'variable' && (
                    <div className='w-2.5 h-2.5 bg-white rounded-full'></div>
                  )}
                </div>
                <div>
                  <h3 className='font-semibold text-base mb-1'>Variable Product</h3>
                  <p className='text-sm text-muted-foreground'>Product with multiple variations (size, color, etc.)</p>
                </div>
              </div>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

