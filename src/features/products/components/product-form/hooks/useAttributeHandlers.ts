/**
 * Custom hook for managing product attributes
 * Handles adding, removing, and expanding attributes and their options
 * 
 * @param form - React Hook Form instance
 * @param generateVariations - Callback to regenerate variations when attributes change
 * @returns Object with attribute manipulation functions
 */

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../schema';
import { useProductFormStore } from './useProductFormState';
import { VARIATION_GENERATION_DELAY } from '../utils/constants';

interface UseAttributeHandlersProps {
  form: UseFormReturn<FormValues>;
  generateVariations?: () => void;
}

export function useAttributeHandlers({ form, generateVariations }: UseAttributeHandlersProps) {
  const store = useProductFormStore();
  const { setExpandedAttributes } = store;

  /**
   * Add a new attribute to the product
   */
  const addAttribute = React.useCallback(() => {
    const attributes = form.getValues('attributes') || [];
    
    // Check if we can add more attributes (limit is 3)
    if (attributes.length >= 3) {
      return;
    }
    
    const newAttributes = [
      ...attributes,
      {
        name: '',
        position: attributes.length,
        visible: false,
        variation: false,
        options: []
      }
    ];
    form.setValue('attributes', newAttributes, { shouldDirty: true, shouldTouch: true });
  }, [form]);

  /**
   * Remove an attribute by index
   */
  const removeAttribute = React.useCallback((index: number) => {
    const attributes = [...(form.getValues('attributes') || [])];
    attributes.splice(index, 1);
    form.setValue('attributes', attributes, { shouldDirty: true, shouldTouch: true });
  }, [form]);

  /**
   * Add a new option to an attribute
   */
  const addOption = React.useCallback((attributeIndex: number) => {
    const attributes = [...(form.getValues('attributes') || [])];
    const options = attributes[attributeIndex].options || [];
    attributes[attributeIndex] = {
      ...attributes[attributeIndex],
      options: [...options, '']
    };
    form.setValue('attributes', attributes, { shouldDirty: true, shouldTouch: true });
  }, [form]);

  /**
   * Remove an option from an attribute
   */
  const removeOption = React.useCallback((attributeIndex: number, optionIndex: number) => {
    const attributes = [...(form.getValues('attributes') || [])];
    const options = [...attributes[attributeIndex].options];
    options.splice(optionIndex, 1);
    
    // If this was the last option, disable variation toggle
    const willHaveNoOptions = options.length === 0;
    
    attributes[attributeIndex] = {
      ...attributes[attributeIndex],
      options,
      // Disable variation if no options remain
      variation: willHaveNoOptions ? false : attributes[attributeIndex].variation,
      visible: willHaveNoOptions ? false : attributes[attributeIndex].visible
    };
    
    if (willHaveNoOptions) {
      // Variation toggle will be disabled automatically
    }
    
    form.setValue('attributes', attributes, { shouldDirty: true, shouldTouch: true });
    
    // Trigger variation generation if variation was disabled
    if (willHaveNoOptions && generateVariations) {
      setTimeout(() => {
        generateVariations();
      }, VARIATION_GENERATION_DELAY);
    }
  }, [form, generateVariations]);

  /**
   * Toggle the expansion state of an attribute
   */
  const toggleAttributeExpansion = React.useCallback((attributeName: string) => {
    setExpandedAttributes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(attributeName)) {
        newSet.delete(attributeName);
      } else {
        newSet.add(attributeName);
      }
      return newSet;
    });
  }, [setExpandedAttributes]);

  return {
    addAttribute,
    removeAttribute,
    addOption,
    removeOption,
    toggleAttributeExpansion
  };
}

