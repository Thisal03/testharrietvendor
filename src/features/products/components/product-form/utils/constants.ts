/**
 * Product Form Constants
 * Business rules and configuration values with documentation
 */

/**
 * Maximum number of product attributes allowed for vendor products
 * This is a WooCommerce limitation for vendor product variations
 */
export const MAX_PRODUCT_ATTRIBUTES = 3;

/**
 * Debounce delay for SKU validation in milliseconds
 * Prevents excessive API calls during user typing
 */
export const DEBOUNCE_SKU_VALIDATION = 300;

/**
 * Timeout for image upload operations in milliseconds
 */
export const IMAGE_UPLOAD_TIMEOUT = 30000;

/**
 * Maximum number of retry attempts for failed operations
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Delay for variation generation after attribute changes (ms)
 * Allows user to finish typing before auto-generating variations
 */
export const VARIATION_GENERATION_DELAY = 150;

/**
 * Progress animation duration in milliseconds
 */
export const PROGRESS_ANIMATION_DURATION = 800;

/**
 * Initial progress percentage when starting upload
 */
export const INITIAL_PROGRESS_PERCENTAGE = 5;

/**
 * Delay before closing progress modal after success (ms)
 */
export const SUCCESS_MODAL_DELAY = 500;

/**
 * Maximum file size for images in bytes (5MB)
 */
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Accepted image MIME types for upload
 */
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

/**
 * Cache invalidation delay after product update (ms)
 * Allows backend cache to clear before refreshing
 */
export const CACHE_INVALIDATION_DELAY = 500;

/**
 * Default attribute options for Size and Color attributes
 * Pre-populated options for quick selection
 */
export const DEFAULT_ATTRIBUTE_OPTIONS = {
  size: [
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: '2XL', label: '2XL' },
    { value: '3XL', label: '3XL' }
  ],
  color: [
    { value: 'red', label: 'Red' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'pink', label: 'Pink' },
    { value: 'purple', label: 'Purple' }
  ]
} as const;

