export interface Product {
  id: number;
  name: string;
  slug: string;
  date_created: any;
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
  date_on_sale_from: any;
  date_on_sale_to: DateOnSaleTo;
  total_sales: number;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: any;
  stock_status: string;
  backorders: string;
  low_stock_amount: string;
  sold_individually: boolean;
  weight: string;
  length: string;
  width: string;
  height: string;
  upsell_ids: any[];
  cross_sell_ids: any[];
  parent_id: number;
  reviews_allowed: boolean;
  purchase_note: string;
  attributes: Attributes;
  default_attributes: any[];
  menu_order: number;
  post_password: string;
  virtual: boolean;
  downloadable: boolean;
  category_ids: number[];
  tag_ids: any[];
  shipping_class_id: number;
  downloads: any[];
  image_id: string;
  gallery_image_ids: any[];
  download_limit: number;
  download_expiry: number;
  rating_counts: any[];
  average_rating: string;
  review_count: number;
  cogs_value: any;
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

interface MetaDaum {
  id: number;
  key: string;
  value: any;
}
