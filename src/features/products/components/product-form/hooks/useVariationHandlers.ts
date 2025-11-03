/**
 * Custom hook for managing product variations
 * Handles variation generation, updates, and toggling expansion
 * 
 * @param form - React Hook Form instance
 * @returns Object with variation manipulation functions and smooth progress
 */

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../schema';
import { Variation } from '../types';
import { useProductFormStore } from './useProductFormState';
import { VARIATION_GENERATION_DELAY } from '../utils/constants';
import { useProductVariations } from './useProductVariations';
import { clearSimpleProductFields, clearVariableProductFields, clearCommonFields } from '../utils/form-helpers';

export function useVariationHandlers(form: UseFormReturn<FormValues>) {
  const store = useProductFormStore();
  const { 
    variations, 
    setVariations,
    expandedVariations,
    setExpandedVariations,
    setExpandedAttributes,
    progress,
    setProgress
  } = store;

  const { generateVariations: generateVariationsUtil } = useProductVariations(variations);

  /**
   * Smoothly animate progress from current to target value
   */
  const smoothProgress = React.useCallback((targetProgress: number, duration: number = 800) => {
    return new Promise<void>((resolve) => {
      const startProgress = progress;
      const diff = targetProgress - startProgress;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const percent = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuad = (t: number) => t * (2 - t);
        const currentProgress = startProgress + (diff * easeOutQuad(percent));
        
        setProgress(currentProgress);
        
        if (percent < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }, [progress, setProgress]);

  /**
   * Generate all possible variation combinations from attributes
   */
  const generateVariations = React.useCallback(() => {
    const attributes = form.getValues('attributes') || [];
    
    const variationAttributes = attributes.filter((attr) => attr.variation);
    
    if (variationAttributes.length === 0) {
      setVariations([]);
      form.setValue('variations', []);
      return;
    }

    const combinations = generateVariationsUtil(form);
    setVariations(combinations);
    form.setValue('variations', combinations as any);
  }, [form, generateVariationsUtil, setVariations]);

  /**
   * Manually trigger variation generation
   */
  const triggerVariationGeneration = React.useCallback(() => {
    generateVariations();
  }, [generateVariations]);

  // Watch product type to determine if we should auto-generate variations
  const productType = form.watch('type');
  const previousType = React.useRef(productType);
  
  // Auto-generate variations when attributes change (Shopify-style)
  React.useEffect(() => {
    // Only subscribe if product type is variable
    if (productType === 'variable') {
      const subscription = form.watch((value, { name }) => {
        // Watch for any attribute changes
        if (name === 'attributes' || name?.startsWith('attributes.')) {
          setTimeout(() => {
            generateVariations();
          }, VARIATION_GENERATION_DELAY);
        }
      });
      
      return () => subscription.unsubscribe();
    }
  }, [form, generateVariations, productType]);
  
  React.useEffect(() => {
    // Only clear fields when type actually changes (not on initial mount)
    if (previousType.current !== productType && previousType.current !== undefined) {
      // Clear all form fields when switching product types
      clearSimpleProductFields(form);
      clearVariableProductFields(form,
        () => setVariations([]),
        () => setExpandedAttributes(new Set()),
        () => setExpandedVariations(new Set())
      );
    }
    previousType.current = productType;
  }, [productType, form, setVariations, setExpandedAttributes, setExpandedVariations]);

  /**
   * Update a single field or multiple fields of a variation
   */
  const updateVariation = React.useCallback((index: number, field: string | Record<string, any>, value?: any) => {
    // Support both single field update and multiple fields update
    const updates = typeof field === 'string' ? { [field]: value } : field;
    
    setVariations((prevVariations) => {
      const updatedVariations = [...prevVariations];
      updatedVariations[index] = {
        ...updatedVariations[index],
        ...updates
      };
      form.setValue('variations', updatedVariations as any);
      return updatedVariations;
    });
  }, [form, setVariations]);

  /**
   * Toggle the expansion state of a variation
   */
  const toggleVariationExpansion = React.useCallback((variationId: string) => {
    setExpandedVariations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(variationId)) {
        newSet.delete(variationId);
      } else {
        newSet.add(variationId);
      }
      return newSet;
    });
  }, [setExpandedVariations]);

  return {
    generateVariations,
    triggerVariationGeneration,
    updateVariation,
    toggleVariationExpansion,
    smoothProgress
  };
}

