export interface Product {
  id: number;
  name: string;
  slug: string;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  date_created: WooCommerceDate;
  date_modified: DateModified;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  global_unique_id: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: WooCommerceDate | null;
  date_on_sale_to: DateOnSaleTo;
  total_sales: number;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  backorders: string;
  low_stock_amount: string;
  sold_individually: boolean;
  weight: string;
  length: string;
  width: string;
  height: string;
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  reviews_allowed: boolean;
  purchase_note: string;
  attributes: Attributes;
  default_attributes: ProductAttribute[];
  menu_order: number;
  post_password: string;
  virtual: boolean;
  downloadable: boolean;
  // WooCommerce returns both formats
  categories?: Array<{ id: number; name: string; slug: string }>;
  category_ids: number[];
  tag_ids: number[];
  shipping_class_id: number;
  downloads: Array<{ id: string; name: string; file: string }>;
  // WooCommerce returns both formats for images
  images?: Array<{ id: number; src: string; name?: string; alt?: string }>;
  image_id: string;
  gallery_image_ids: number[];
  download_limit: number;
  download_expiry: number;
  rating_counts: Array<{ rating: number; count: number }>;
  average_rating: string;
  review_count: number;
  cogs_value: number | null;
  meta_data: MetaDaum[];
  permalink: string;
  featured_image: string;
}

interface DateModified {
  date: string;
  timezone_type: number;
  timezone: string;
}

interface DateOnSaleTo {
  date: string;
  timezone_type: number;
  timezone: string;
}

interface Attributes {
  pa_size: PaSize;
}

interface PaSize {}

/**
 * Represents a WooCommerce date structure with timezone information
 */
export interface WooCommerceDate {
  date: string;
  timezone_type: number;
  timezone: string;
}

/**
 * Represents metadata value types that can be stored in WooCommerce meta_data
 */
export type MetaDataValue = string | number | boolean | null | Record<string, unknown> | MetaDataValue[];

/**
 * Represents a product attribute configuration
 */
export interface ProductAttribute {
  id?: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

/**
 * Represents a product attribute with a required ID
 */
export interface ProductAttributeWithId extends ProductAttribute {
  id: number;
}

interface MetaDaum {
  id: number;
  key: string;
  value: MetaDataValue;
}
