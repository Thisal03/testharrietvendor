/**
 * Input sanitization utilities for user inputs
 * Prevents XSS attacks and ensures data integrity
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration for HTML sanitization
 * Only allows safe HTML tags for product descriptions
 */
const HTML_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code',
  'pre'
];

const HTML_ALLOWED_ATTR = ['href', 'target', 'rel', 'title'];

/**
 * Sanitize plain text input (removes potentially dangerous characters)
 * Used for: product names, SKUs, weights, prices
 */
export function sanitizeText(text: string | undefined): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = text.trim();

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  return sanitized;
}

/**
 * Sanitize HTML content with DOMPurify
 * Used for: product descriptions
 */
export function sanitizeHTML(html: string | undefined): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: HTML_ALLOWED_TAGS,
    ALLOWED_ATTR: HTML_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  });
}

/**
 * Sanitize URL to ensure it's safe
 * Used for: image URLs, links in descriptions
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  let sanitized = url.trim();

  // Only allow http, https, or relative URLs
  if (!sanitized.match(/^(https?:\/\/|\/)/i)) {
    return '';
  }

  // Remove null bytes and other control characters
  sanitized = sanitized.replace(/[\0\s]/g, '');

  return sanitized;
}

/**
 * Sanitize a numeric value (for prices, quantities, etc.)
 */
export function sanitizeNumber(value: string | number | undefined): string {
  if (typeof value === 'number') {
    return value.toString();
  }

  if (!value || typeof value !== 'string') {
    return '';
  }

  // Remove any non-numeric characters except decimal point
  const sanitized = value.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join('')}`;
  }

  return sanitized;
}

/**
 * Sanitize an object containing user input
 * Recursively sanitizes all string values
 */
export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Apply appropriate sanitization based on key name
      if (key.includes('description')) {
        sanitized[key] = sanitizeHTML(value);
      } else if (key.includes('url') || key.includes('src') || key.includes('href')) {
        sanitized[key] = sanitizeURL(value);
      } else if (key.includes('price') || key.includes('quantity') || key.includes('weight')) {
        sanitized[key] = sanitizeNumber(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else if (value !== null && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize product data before sending to API
 */
export interface SanitizedProductData {
  name: string;
  description: string;
  sku?: string;
  weight?: string;
  regular_price?: string;
  sale_price?: string;
}

export function sanitizeProductData(data: Record<string, unknown>): SanitizedProductData {
  return {
    name: sanitizeText(data.name as string),
    description: sanitizeHTML(data.description as string),
    sku: data.sku ? sanitizeText(data.sku as string) : undefined,
    weight: data.weight ? sanitizeNumber(data.weight as string) : undefined,
    regular_price: data.regular_price ? sanitizeNumber(data.regular_price as string) : undefined,
    sale_price: data.sale_price ? sanitizeNumber(data.sale_price as string) : undefined
  };
}

