/**
 * Form helper utilities for product form
 * Centralizes common form manipulation and validation utilities
 */

import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../schema';

/**
 * Clear all form fields related to simple product
 * Used when switching from simple to variable product type
 * 
 * @param form - React Hook Form instance
 */
export function clearSimpleProductFields(form: UseFormReturn<FormValues>): void {
  form.setValue('price', '');
  form.setValue('on_sale', false);
  form.setValue('sale_price', '');
  form.setValue('has_sale_dates', false);
  form.setValue('sale_start_date', '');
  form.setValue('sale_end_date', '');
  form.setValue('stock_status', 'instock');
  form.setValue('manage_stock', false);
  form.setValue('stock_quantity', 0);
  form.setValue('sku', '');
  form.setValue('weight', '');
}

/**
 * Clear all form fields related to variable product
 * Used when switching from variable to simple product type
 * 
 * @param form - React Hook Form instance
 * @param onClearVariations - Callback to clear variations state
 * @param onClearAttributes - Callback to clear attributes state
 * @param onClearExpandedVariations - Callback to clear expanded variations state
 */
export function clearVariableProductFields(
  form: UseFormReturn<FormValues>,
  onClearVariations: () => void,
  onClearAttributes: () => void,
  onClearExpandedVariations: () => void
): void {
  form.setValue('attributes', []);
  form.setValue('default_attributes', []);
  onClearVariations();
  form.setValue('variations', []);
  onClearAttributes();
  onClearExpandedVariations();
}

/**
 * Clear common fields when switching product types
 * Used to reset shared fields like images and size chart
 * 
 * @param form - React Hook Form instance
 */
export function clearCommonFields(form: UseFormReturn<FormValues>): void {
  form.setValue('images', []);
  form.setValue('size_chart', []);
  form.setValue('has_size_chart', false);
}

/**
 * Check if a product is on sale based on sale price
 * 
 * @param salePrice - The sale price value
 * @returns True if product is on sale
 */
export function isProductOnSale(salePrice: string | undefined): boolean {
  return !!(salePrice && salePrice !== '');
}

/**
 * Validate that at least one image is provided
 * 
 * @param images - Array of image values (File objects or {src: string, id?: number} objects)
 * @returns True if at least one image exists
 */
export function hasAtLeastOneImage(images: Array<File | { src: string; id?: number }> | undefined): boolean {
  return !!(images && images.length > 0);
}

