/**
 * Custom hook for handling product form submission
 * Extracts the complex onSubmit logic from ProductForm component
 * 
 * @param props - Hook props
 * @param props.form - React Hook Form instance
 * @param props.initialData - Product data for edit mode (null for create mode)
 * @param props.smoothProgress - Progress animation function
 * @returns Object with onSubmit callback
 * 
 * @remarks
 * Orchestrates the entire product submission process:
 * - Validates SKU before proceeding
 * - Uploads images (main, size chart, variations) with progress tracking
 * - Transforms form data to WooCommerce format
 * - Creates/updates product via API
 * - Handles variations (create/update/delete)
 * - Invalidates cache and refreshes router
 * - Shows user-friendly error messages
 * 
 * Handles both create and update flows with proper variation management.
 * Includes rollback mechanisms for data integrity.
 * 
 * @example
 * ```tsx
 * const { onSubmit } = useProductFormSubmit({ form, initialData, smoothProgress });
 * 
 * <form onSubmit={form.handleSubmit(onSubmit)}>
 *   // form fields
 * </form>
 * ```
 */

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Product } from '@/framework/products/types';
import { createProduct } from '@/framework/products/create-product';
import { updateProduct } from '@/framework/products/update-product';
import { UploadedImage } from '@/framework/products/upload-product-image';
import { createMultipleVariations, createVariation } from '@/framework/products/create-variation';
import { getAllVariations } from '@/framework/products/get-all-variations';
import { updateVariation } from '@/framework/products/update-variation';
import { deleteVariation } from '@/framework/products/delete-variation';
import { transformFormDataToWooCommerce, transformVariationsData, prepareImageUploads } from '../utils/transform-helpers';
import { invalidateTag } from '@/framework/revalidate';
import { logError, formatErrorMessage } from '@/lib/errors/error-handler';
import { isProductError } from '@/lib/errors/product-errors';
import { FormValues } from '../schema';
import { useProductFormStore } from './useProductFormState';
import { useProductImages } from './useProductImages';

interface UseProductFormSubmitProps {
  form: UseFormReturn<FormValues>;
  initialData: Product | null;
  smoothProgress: (targetProgress: number, duration?: number) => Promise<void>;
}

export function useProductFormSubmit({
  form,
  initialData,
  smoothProgress
}: UseProductFormSubmitProps) {
  const router = useRouter();
  const store = useProductFormStore();
  const {
    isSKUValid,
    productStatus,
    setIsSubmitting,
    setShowProgress,
    setProgress,
    setProgressStatus,
    setProgressMessage
  } = store;
  const { uploadImages } = useProductImages();

  const onSubmit = React.useCallback(async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Check if SKU is valid before proceeding (skip for draft)
      if (!isSKUValid && productStatus !== 'draft') {
        toast.error('Please fix the SKU validation error before submitting');
        setIsSubmitting(false);
        return;
      }
      
      // Initialize progress modal
      setShowProgress(true);
      setProgress(0);
      setProgressStatus('uploading');
      setProgressMessage('Preparing images...');
      
      // Prepare images for upload
      const { mainImages, existingImages, sizeChart, existingSizeChart, variationImages } = prepareImageUploads(values);
      
      // Calculate progress increments
      const totalSteps = mainImages.length + (sizeChart ? 1 : 0) + variationImages.size + 3; // +3 for product creation, variations, and finalization
      const progressPerStep = 100 / totalSteps;
      let currentProgress = 0;
      
      // Smoothly animate to 5% for preparation
      await smoothProgress(5, 400);
      currentProgress = 5;
      
      // Upload all images using useProductImages hook
      const { allImages, sizeChartToUse, uploadedVariationImages, newProgress } = await uploadImages({
        values,
        setProgressMessage,
        smoothProgress,
        progressPerStep,
        currentProgress
      });

      currentProgress = newProgress;

      // Switch to creating status
      setProgressStatus('creating');
      setProgressMessage(initialData ? 'Updating product...' : 'Creating product...');

      // Transform form data to WooCommerce format
      const productData = transformFormDataToWooCommerce(values, allImages, sizeChartToUse, uploadedVariationImages, productStatus);

      // Create or update product
      let product: any;
      if (initialData?.id) {
        product = await updateProduct(initialData.id, productData);
        
        const targetProgress = currentProgress + progressPerStep;
        await smoothProgress(targetProgress, 1000);
        currentProgress = targetProgress;
        
        // If variable product, handle variations
        if (values.type === 'variable' && values.variations && values.variations.length > 0) {
          setProgressMessage('Updating product variations...');
          
          // Fetch existing variations to compare
          const existingVariations = await getAllVariations(product.id, {}, { noCache: true });
          
          const variationsData = transformVariationsData(values, uploadedVariationImages);
          
          // Map to track existing variations by their attributes
          const existingVariationsMap = new Map(
            existingVariations.map((v: any) => {
              const attrKey = v.attributes
                ?.map((a: any) => `${a.name}:${a.option}`)
                .sort()
                .join('|') || '';
              return [attrKey, v];
            })
          );
         
          // Frontend shows ALL variations (enabled/disabled), but WooCommerce only stores ENABLED ones
          // When updating: disabled variations = deleted from WooCommerce, enabled variations = updated/created
          
          // Create/update variations in parallel for better performance
          const variationPromises = variationsData.map(async (variationData) => {
            const attrKey = variationData.attributes
              ?.map((a: any) => `${a.name}:${a.option}`)
              .sort()
              .join('|') || '';
            
            const existingVar = existingVariationsMap.get(attrKey);
            
            if (existingVar) {
              // Update existing variation
              await updateVariation((product as any).id, existingVar.id, variationData);
              existingVariationsMap.delete(attrKey); // Mark as processed
            } else {
              // Create new variation (newly enabled variation)
              await createVariation((product as any).id, variationData);
            }
          });
          
          await Promise.all(variationPromises);
          
          // Delete variations that no longer exist (disabled variations or completely removed) - in parallel
          const deletePromises = Array.from(existingVariationsMap.entries()).map(async ([, oldVar]) => {
            await deleteVariation((product as any).id, oldVar.id);
          });
          
          await Promise.all(deletePromises);
          
          const targetProgress = currentProgress + progressPerStep;
          await smoothProgress(targetProgress, 1000);
          currentProgress = targetProgress;
        }
      } else {
        product = await createProduct(productData);
        
        const targetProgress = currentProgress + progressPerStep;
        await smoothProgress(targetProgress, 800);
        currentProgress = targetProgress;
        
        // If variable product, create variations
        if (values.type === 'variable' && values.variations && values.variations.length > 0) {
          setProgressMessage('Creating product variations...');
          
          const variationsData = transformVariationsData(values, uploadedVariationImages);
          await createMultipleVariations(product.id, variationsData);
          
          const targetProgress = currentProgress + progressPerStep;
          await smoothProgress(targetProgress, 1000);
          currentProgress = targetProgress;
        }
      }

      // Revalidate product cache
      setProgressMessage('Finalizing...');
      
      // Wait for all cache invalidations to complete before refreshing
      await Promise.all([
        invalidateTag('products'),
        product?.id ? invalidateTag(`product-${product.id}`) : Promise.resolve(),
        product?.id ? invalidateTag(`variations-${product.id}`) : Promise.resolve(),
        product?.id ? fetch(`/api/revalidate?path=/dashboard/product/${product.id}`, { method: 'POST' }).catch(() => {}) : Promise.resolve(),
        fetch('/api/revalidate?path=/dashboard/product', { method: 'POST' }).catch(() => {})
      ]);
      
      // Give cache a moment to fully clear
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Smooth progress to 100%
      await smoothProgress(100, 800);
      
      setProgressStatus('success');
      setProgressMessage(initialData ? 'Product updated successfully!' : 'Product created successfully!');

      // Wait a moment before action
      setTimeout(() => {
        setShowProgress(false);
        // For create, redirect to the product list
        // For update, stay on the edit page
        if (!initialData) {
          router.push('/dashboard/product');
        }
        router.refresh();
      }, 500);
    } catch (error) {
      logError(error, { action: 'submit_product_form', productId: initialData?.id });
      
      // Extract user-friendly error message using formatErrorMessage
      let errorMessage = formatErrorMessage(error);
      
      // Provide specific error messages for common scenarios if no custom message
      if (errorMessage === 'An unexpected error occurred') {
        if (error instanceof Error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('sku')) {
            errorMessage = 'The product SKU you entered already exists. Please choose a different SKU.';
          } else if (msg.includes('image') || msg.includes('upload')) {
            errorMessage = 'Failed to upload one or more images. Please check your image files and try again.';
          } else if (msg.includes('validation')) {
            errorMessage = 'The product data failed validation. Please check all fields and try again.';
          } else if (msg.includes('network') || msg.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (msg.includes('rollback') || msg.includes('transaction')) {
            errorMessage = 'Product operation failed and was rolled back for data integrity. Please try again.';
          } else if (msg.includes('variation')) {
            errorMessage = 'Failed to save one or more variations. Please check your variation data and try again.';
          } else {
            errorMessage = 'Failed to save product. Please try again.';
          }
        }
      }
      
      // Also show toast notification for better visibility
      toast.error(errorMessage, {
        duration: 5000,
      });
      
      setProgressStatus('error');
      setProgressMessage(errorMessage);
      
      // Auto-close error after 5 seconds (or keep it open if it's a recoverable error)
      const isRecoverable = isProductError(error) ? error.isRecoverable() : false;
      if (!isRecoverable) {
        setTimeout(() => {
          setShowProgress(false);
        }, 5000);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [form, initialData, isSKUValid, productStatus, smoothProgress, setIsSubmitting, setShowProgress, setProgress, setProgressStatus, setProgressMessage, uploadImages, router]);

  return { onSubmit };
}

