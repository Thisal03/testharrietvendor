/**
 * Hook for managing product image uploads
 * Handles parallel uploads, progress tracking, and error handling
 * 
 * @returns Object with uploadImages function
 * 
 * @remarks
 * Manages the complete image upload workflow for product submission:
 * - Separates new uploads from existing images
 * - Uploads main product images in parallel for performance
 * - Handles size chart uploads
 * - Uploads variation images in parallel
 * - Tracks progress with smooth animations
 * 
 * Uses transform-helpers to prepare images and upload-product-image API.
 * 
 * @example
 * ```tsx
 * const { uploadImages } = useProductImages();
 * 
 * const result = await uploadImages({
 *   values: formValues,
 *   setProgressMessage: (msg) => console.log(msg),
 *   smoothProgress: animateProgress,
 *   progressPerStep: 10,
 *   currentProgress: 50
 * });
 * ```
 */

import { useCallback } from 'react';
import { uploadMultipleImagesLegacy, UploadedImage } from '@/framework/products/upload-product-image';
import { prepareImageUploads } from '../utils/transform-helpers';
import { FormValues } from '../schema';

interface UploadImagesParams {
  values: FormValues;
  setProgressMessage: (message: string) => void;
  smoothProgress: (targetProgress: number, duration: number) => Promise<void>;
  progressPerStep: number;
  currentProgress: number;
}

interface UploadImagesResult {
  allImages: (UploadedImage | { src: string; id?: number })[];
  sizeChartToUse: UploadedImage | { src: string; id?: number } | undefined;
  uploadedVariationImages: Map<string, UploadedImage>;
  newProgress: number;
}

export function useProductImages() {
  const uploadImages = useCallback(async ({
    values,
    setProgressMessage,
    smoothProgress,
    progressPerStep,
    currentProgress
  }: UploadImagesParams): Promise<UploadImagesResult> => {
    let progress = currentProgress;

    // Prepare images for upload
    const { mainImages, existingImages, sizeChart, existingSizeChart, variationImages } = prepareImageUploads(values);

    // Upload main product images IN PARALLEL
    let uploadedMainImages: UploadedImage[] = [];
    if (mainImages.length > 0) {
      setProgressMessage(`Uploading ${mainImages.length} images...`);
      uploadedMainImages = await uploadMultipleImagesLegacy(mainImages);
      
      // Smooth progress for all images uploaded
      const targetProgress = progress + (progressPerStep * mainImages.length);
      await smoothProgress(targetProgress, 800);
      progress = targetProgress;
    }
    
    // Combine uploaded images with existing images
    const allImages = [...existingImages, ...uploadedMainImages];

    // Upload size chart if new file, otherwise use existing
    let sizeChartToUse: UploadedImage | { src: string; id?: number } | undefined = undefined;
    if (sizeChart) {
      setProgressMessage('Uploading size chart...');
      sizeChartToUse = await uploadMultipleImagesLegacy([sizeChart]).then(imgs => imgs[0]);
      
      const targetProgress = progress + progressPerStep;
      await smoothProgress(targetProgress, 600);
      progress = targetProgress;
    } else if (existingSizeChart) {
      sizeChartToUse = { src: existingSizeChart };
    }

    // Upload variation images IN PARALLEL
    const uploadedVariationImages = new Map<string, UploadedImage>();
    if (variationImages.size > 0) {
      const variationImageEntries = Array.from(variationImages.entries());
      const variationFiles = variationImageEntries.map(([, file]) => file);
      const variationIds = variationImageEntries.map(([id]) => id);
      
      setProgressMessage(`Uploading ${variationImages.size} variation images...`);
      const uploadedVariationImagesArray = await uploadMultipleImagesLegacy(variationFiles);
      
      // Map uploaded images back to their variation IDs
      uploadedVariationImagesArray.forEach((uploadedImage, index) => {
        uploadedVariationImages.set(variationIds[index], uploadedImage);
      });
      
      // Smooth progress for all variation images uploaded
      const targetProgress = progress + (progressPerStep * variationImages.size);
      await smoothProgress(targetProgress, 800);
      progress = targetProgress;
    }

    return {
      allImages,
      sizeChartToUse,
      uploadedVariationImages,
      newProgress: progress
    };
  }, []);

  return { uploadImages };
}

