export interface Variation {
  id: string;
  attributes: Record<string, string>;
  image: File | null;
  price: string;
  on_sale: boolean;
  sale_price: string;
  has_sale_dates: boolean;
  sale_start_date: string;
  sale_end_date: string;
  stock_status: 'instock' | 'outofstock';
  manage_stock: boolean;
  stock_quantity: number;
  sku: string;
  weight: string;
  enabled: boolean;
}

export interface AttributeOption {
  value: string;
  label: string;
}

