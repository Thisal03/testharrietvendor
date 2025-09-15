export interface Order {
  id: number;
  parent_id: number;
  status: string;
  currency: string;
  version: string;
  prices_include_tax: boolean;
  date_created: DateCreated;
  date_modified: DateModified;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: Billing;
  shipping: Shipping;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed: any;
  date_paid: any;
  cart_hash: string;
  order_stock_reduced: boolean;
  download_permissions_granted: boolean;
  new_order_email_sent: boolean;
  recorded_sales: boolean;
  recorded_coupon_usage_counts: boolean;
  number: string;
  meta_data: MetaDaum[];
  line_items: LineItems;
  tax_lines: any[];
  shipping_lines: ShippingLines;
  fee_lines: any[];
  coupon_lines: any[];
}

interface DateCreated {
  date: string;
  timezone_type: number;
  timezone: string;
}

interface DateModified {
  date: string;
  timezone_type: number;
  timezone: string;
}

interface Billing {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

interface Shipping {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
}

interface MetaDaum {
  id: number;
  key: string;
  value: any;
}

interface LineItems {
  [key: string]: N9431;
}

interface N9431 {
  id: number;
  order_id: number;
  name: string;
  product_id: number;
  product_image?: {
    alt: string;
    full: string;
    id: number;
    large: string;
    medium: string;
    thumbnail: string;
    url: string;
  };
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: Taxes;
  meta_data: MetaDaum2[];
}

interface Taxes {
  total: any[];
  subtotal: any[];
}

interface MetaDaum2 {
  id: number;
  key: string;
  value: string;
}

interface ShippingLines {
  '9432': N9432;
}

interface N9432 {
  legacy_values: any;
  legacy_cart_item_key: any;
  legacy_package_key: any;
}
