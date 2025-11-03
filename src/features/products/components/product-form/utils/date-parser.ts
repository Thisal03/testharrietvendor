/**
 * Date Parsing Utilities
 * Handles various date formats from WooCommerce API and converts to YYYY-MM-DD format
 */

import { logError } from '@/lib/errors/error-handler';

/**
 * Parse sale date from various formats
 * 
 * @param dateValue - Date value that can be string, object with date property, or null
 * @param fieldName - Name of the field for error logging (e.g., 'sale start date')
 * @returns Formatted date string in YYYY-MM-DD format or empty string if invalid
 * 
 * @example
 * ```typescript
 * const startDate = parseSaleDate(product.date_on_sale_from, 'sale start date');
 * // Returns: '2024-01-15' or ''
 * ```
 */
export function parseSaleDate(
  dateValue: unknown,
  fieldName: string
): string {
  if (!dateValue || dateValue === null) {
    return '';
  }

  // Handle nested object format { date: '...', timezone_type: ..., timezone: '...' }
  const dateString = 
    typeof dateValue === 'object' && 'date' in dateValue
      ? dateValue.date
      : dateValue;

  if (!dateString || typeof dateString !== 'string') {
    return '';
  }

  try {
    // Parse the date string and extract just the date part (YYYY-MM-DD)
    const datePart = dateString.split('T')[0];
    if (!datePart || datePart.length < 10) {
      return '';
    }
    return datePart;
  } catch (error) {
    logError(error, { action: 'parse_sale_date', fieldName });
    return '';
  }
}

/**
 * Parse variation sale date from API response
 * Handles both string and numeric date values
 * 
 * @param dateValue - Date value from variation data
 * @returns Formatted date string in YYYY-MM-DD format or empty string if invalid
 */
export function parseVariationSaleDate(dateValue: unknown): string {
  if (!dateValue || dateValue === null) {
    return '';
  }

  try {
    // Extract just the date part (YYYY-MM-DD)
    const dateString = typeof dateValue === 'string' ? dateValue : String(dateValue);
    const datePart = dateString.split('T')[0];
    if (!datePart || datePart.length < 10) {
      return '';
    }
    return datePart;
  } catch (error) {
    logError(error, { action: 'parse_variation_sale_date' });
    return '';
  }
}

/**
 * Check if a product has sale dates configured
 * 
 * @param fromDate - Start date value
 * @param toDate - End date value
 * @returns True if either date has a value
 */
export function hasSaleDates(fromDate: unknown, toDate: unknown): boolean {
  const from = fromDate && typeof fromDate === 'object' && 'date' in fromDate
    ? (fromDate as any).date
    : fromDate;
  const to = toDate && typeof toDate === 'object' && 'date' in toDate
    ? (toDate as any).date
    : toDate;
  
  return !!(from || to);
}

