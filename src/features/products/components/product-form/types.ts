import { ProductAttribute, ProductAttributeWithId } from '@/framework/products/types';
import { z } from 'zod';

/**
 * Represents a file in the form (either a new File upload or existing file data)
 */
export type FormFile = File | {
  src: string;
  id?: number;
  name?: string;
  preview?: string;
};

/**
 * Represents a variation image in the form
 */
export type VariationImage = string | File | {
  src: string;
  preview?: string;
  name?: string;
};

/**
 * Represents a product attribute that may or may not have an ID
 */
export type ProductAttributeOrWithId = ProductAttribute | ProductAttributeWithId;

/**
 * Type guard to check if an attribute has an ID
 */
export function hasAttributeId(attr: ProductAttributeOrWithId): attr is ProductAttributeWithId {
  return 'id' in attr && attr.id !== undefined;
}

/**
 * Represents updates to a variation field
 */
export type VariationUpdate = Record<string, string | number | boolean | VariationImage | null | undefined>;

/**
 * Variation schema for form validation
 */
const variationSchema = z.object({
  id: z.string(),
  variation_id: z.number().optional(), // Real WooCommerce variation ID for SKU validation
  attributes: z.record(z.string(), z.string()),
  image: z.union([z.string(), z.instanceof(File), z.object({ src: z.string(), preview: z.string().optional(), name: z.string().optional() }), z.null()]).optional(),
  price: z.string().optional(),
  on_sale: z.boolean(),
  sale_price: z.string().optional(),
  has_sale_dates: z.boolean(),
  sale_start_date: z.string().optional(),
  sale_end_date: z.string().optional(),
  stock_status: z.enum(['instock', 'outofstock']),
  manage_stock: z.boolean(),
  stock_quantity: z.number(),
  sku: z.string().optional(),
  weight: z.string().optional(),
  enabled: z.boolean()
}).refine((data) => {
  if (!data.enabled) return true;
  return !!(data.price && data.price.trim() !== '');
}, {
  message: 'Price is required for enabled variations',
  path: ['price']
});

/**
 * Represents a product variation in the form
 */
export type Variation = z.infer<typeof variationSchema>;
