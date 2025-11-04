'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
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
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Product } from '@/framework/products/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { formSchema, FormValues } from './product-form/schema';
import { ProductFormTypeSelector } from './product-form/sections/ProductFormTypeSelector';
import { useProductData } from './product-form/hooks/useProductData';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, HelpCircle } from 'lucide-react';
import { ProgressModal } from '@/components/ui/progress-modal';
import { useProductFormStore } from './product-form/hooks/useProductFormState';
import { logError } from '@/lib/errors/error-handler';
import { useProductFormSubmit } from './product-form/hooks/useProductFormSubmit';
import { useVariationHandlers } from './product-form/hooks/useVariationHandlers';
import { useAttributeHandlers } from './product-form/hooks/useAttributeHandlers';
import { useProductFormInit, computeDefaultValues } from './product-form/hooks/useProductFormInit';
import { deleteProduct } from '@/framework/products/delete-product';
import { invalidateTag } from '@/framework/revalidate';

// Use wrapper components for better modularity
import { SimpleProductForm } from './product-form/simple/SimpleProductForm';
import { VariableProductForm } from './product-form/variable/VariableProductForm';

// Section components
import { ProductFormBasicInfo } from './product-form/sections/ProductFormBasicInfo';
import { ProductFormActions } from './product-form/sections/ProductFormActions';

export default function ProductForm({
  initialData,
  pageTitle
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const { categories: dynamicCategories, isLoading: isCategoriesLoading } = useProductData();
  
  // Initialize Zustand store
  const store = useProductFormStore();
  const {
    vendorId,
    selectedCategories, setSelectedCategories,
    expandedAttributes,
    variations,
    expandedVariations,
    isSubmitting,
    isSKUValid,
    setProductStatus,
    showProgress, setShowProgress,
    progress,
    progressStatus,
    progressMessage
  } = store;
  
  const productId = initialData?.id; // Get current product ID for SKU validation

  // Initialize form with computed default values to prevent uncontrolled-to-controlled warnings
  const defaultValues = React.useMemo(() => computeDefaultValues(initialData), [initialData]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  // Initialize form with all side effects - vendor fetch, category init, attribute expansion, variation fetch
  useProductFormInit({ initialData, form });

  // Custom hooks for extracted logic
  const variationHandlers = useVariationHandlers(form);
  const { smoothProgress, generateVariations, triggerVariationGeneration, updateVariation, toggleVariationExpansion } = variationHandlers;
  const attributeHandlers = useAttributeHandlers({ form, generateVariations });
  const { addAttribute, removeAttribute, addOption, removeOption, toggleAttributeExpansion } = attributeHandlers;
  const { onSubmit } = useProductFormSubmit({ form, initialData, smoothProgress });

  // Delete handler
  const handleDelete = React.useCallback(async () => {
    if (!initialData?.id) return;
    
    try {
      await deleteProduct(initialData.id);
      await invalidateTag('products');
      await invalidateTag(`product-${initialData.id}`);
      toast.success('Product deleted successfully');
      router.push('/dashboard/product');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product. Please try again.');
    }
  }, [initialData?.id, router]);

  // Handler for draft saves that bypasses validation
  const handleSubmitWithoutValidation = React.useCallback((status: 'draft' | 'pending' | 'publish') => {
    setProductStatus(status);
    const values = form.getValues();
    // Pass status directly to onSubmit to override store value (avoid async state update issue)
    onSubmit(values, status);
  }, [form, onSubmit, setProductStatus]);

  // All initialization handled by useProductFormInit hook above

  return (
    <TooltipProvider>
      <Card className='mx-auto w-full max-w-5xl shadow-sm'>
        <CardHeader className='border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900'>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
          <p className='text-sm text-muted-foreground mt-1'>
            Fill in the required information below to create your product
          </p>
        </CardHeader>
        <CardContent className='pt-3'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => onSubmit(values), (errors) => {
            const errorFields = Object.keys(errors);
            if (errorFields.length > 0) {
              // Try to get the most specific error message
              let errorMessage = '';
              
              // Helper to get nested error messages
              const getErrorMessage = (fieldError: unknown): string => {
                if (!fieldError) return '';
                if (typeof fieldError === 'object' && fieldError !== null) {
                  if ('message' in fieldError && typeof fieldError.message === 'string') {
                    return fieldError.message;
                  }
                  // Handle nested objects (like variations array)
                  if ('root' in fieldError) {
                    return getErrorMessage(fieldError.root);
                  }
                  // Try to find message in any nested property
                  for (const key in fieldError) {
                    const nestedError = getErrorMessage((fieldError as Record<string, unknown>)[key]);
                    if (nestedError) return nestedError;
                  }
                }
                return '';
              };
              
              for (const field of errorFields) {
                const fieldError = errors[field as keyof typeof errors];
                errorMessage = getErrorMessage(fieldError);
                if (errorMessage) {
                  // Add field name for context
                  const fieldName = field === 'images' ? 'Images' :
                                   field === 'name' ? 'Product Name' :
                                   field === 'description' ? 'Description' :
                                   field === 'categories' ? 'Categories' :
                                   field === 'price' ? 'Price' :
                                   field === 'sku' ? 'SKU' :
                                   field === 'variations' ? 'Variations' :
                                   field === 'stock_quantity' ? 'Stock Quantity' :
                                   field;
                  
                  toast.error(`${fieldName}: ${errorMessage}`, {
                    duration: 6000,
                  });
                  break; // Show first error only
                }
              }
              
              if (!errorMessage) {
                toast.error(`Please fix the form errors in these fields: ${errorFields.join(', ')}`, {
                  duration: 6000,
                });
              }
            }
          })} className='space-y-8'>
            {/* Basic Information Section */}
            <ProductFormBasicInfo form={form} />

            {/* Product Type Selection */}
            <ProductFormTypeSelector form={form} isUpdateMode={!!initialData} />


            {/* Conditional Fields Based on Product Type */}
            {form.watch('type') === 'simple' && (
              <SimpleProductForm
                form={form}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                dynamicCategories={dynamicCategories}
                isCategoriesLoading={isCategoriesLoading}
                vendorId={vendorId}
                productId={productId}
              />
            )}

            {form.watch('type') === 'variable' && (
              <VariableProductForm
                form={form}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                dynamicCategories={dynamicCategories}
                isCategoriesLoading={isCategoriesLoading}
                expandedAttributes={expandedAttributes}
                onToggleAttributeExpansion={toggleAttributeExpansion}
                onAddAttribute={addAttribute}
                onRemoveAttribute={removeAttribute}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                variations={variations}
                expandedVariations={expandedVariations}
                onToggleVariationExpansion={toggleVariationExpansion}
                onUpdateVariation={updateVariation}
                onGenerateVariations={triggerVariationGeneration}
                vendorId={vendorId}
                productId={productId}
              />
            )}

            {/* Action Buttons */}
            <ProductFormActions 
              isSubmitting={isSubmitting}
              isUpdateMode={!!initialData}
              productId={initialData?.id}
              onCancel={() => router.push('/dashboard/product')}
              onDelete={initialData ? handleDelete : undefined}
              onStatusChange={setProductStatus}
              onSubmitWithoutValidation={handleSubmitWithoutValidation}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
    
    {/* Progress Modal */}
    <ProgressModal
      isOpen={showProgress}
      progress={progress}
      status={progressStatus}
      message={progressMessage}
      onClose={() => setShowProgress(false)}
    />
    </TooltipProvider>
  );
}

