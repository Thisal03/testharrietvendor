'use client';

import {
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { AlertModal } from '@/components/modal/alert-modal';
import { FormValues } from '../schema';

interface ProductTypeSelectorProps {
  form: UseFormReturn<FormValues>;
  isUpdateMode?: boolean;
}

/**
 * Component for selecting product type (simple or variable)
 * 
 * Provides radio buttons for choosing between simple and variable product types.
 * Shows a confirmation dialog when changing types in update mode to warn about data loss.
 * 
 * @param props - Component props
 * @param props.form - React Hook Form instance
 * @param props.isUpdateMode - Whether the form is in edit/update mode
 * @returns JSX element with product type selector UI
 */
export function ProductTypeSelector({ form, isUpdateMode = false }: ProductTypeSelectorProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingType, setPendingType] = useState<string | null>(null);

  const handleTypeChange = (newType: string) => {
    const currentType = form.getValues('type');
    
    // If clicking the same type, no action needed
    if (currentType === newType) {
      return;
    }
    
    // If changing to a different type and in update mode, show confirmation
    if (currentType !== newType && isUpdateMode) {
      setPendingType(newType);
      setShowConfirmDialog(true);
    } else if (currentType !== newType) {
      // In create mode, change type directly
      form.setValue('type', newType);
    }
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      form.setValue('type', pendingType);
      setShowConfirmDialog(false);
      setPendingType(null);
    }
  };

  const cancelTypeChange = () => {
    setShowConfirmDialog(false);
    setPendingType(null);
  };

  const targetTypeName = pendingType === 'simple' ? 'Simple' : 'Variable';
  const losingData = pendingType === 'simple' 
    ? 'variations, attributes, and variation-specific settings'
    : 'price, SKU, stock settings, sale settings, and weight';

  return (
    <>
      <AlertModal
        isOpen={showConfirmDialog}
        onClose={cancelTypeChange}
        onConfirm={confirmTypeChange}
        loading={false}
        title='Change Product Type?'
        description={`Changing to ${targetTypeName} product will remove all ${losingData}. This action cannot be undone. Are you sure you want to proceed? (You can later simply click cancel in the bottom of the form to revert the all changes you made.)`}
        confirmText='Change Type'
      />
      
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
                onClick={() => handleTypeChange('simple')}
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
                onClick={() => handleTypeChange('variable')}
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
    </>
  );
}

