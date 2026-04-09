export interface Category {
  id: string;
  name_fr: string;
  name_ar: string;
  slug: string;
  image?: string;
}

export interface Brand {
  id: string;
  name_fr: string;
  name_ar: string;
  logo: string;
}

export interface Collection {
  id: string;
  name_fr: string;
  name_ar: string;
  cover_image?: string;
}

export interface Tag {
  id: string;
  name_fr: string;
  name_ar: string;
  slug: string;
  show_on_homepage?: boolean;
  homepage_order?: number;
}

export type ProductType = 'perfume' | 'flacon';

export interface BaseProduct {
  id: string;
  product_type: ProductType;
  name_fr: string;
  name_ar: string;
  slug: string;
  description_fr: string;
  description_ar: string;
  category_id: string;
  brand_id?: string | null;
  collection_id?: string | null;
  tag_ids: string[];
  images: string[];
  status: 'active' | 'draft';
  created_at: string;
}

export interface PerfumeProduct extends BaseProduct {
  product_type: 'perfume';
  price_per_gram: number; // DZD
  stock_grams: number;
}

export interface FlaconVariant {
  id: string;
  product_id?: string;
  size_ml: number;
  color: string;
  color_name: string;
  shape: string;
  price: number;
  stock_units: number;
}

export interface FlaconProduct extends BaseProduct {
  product_type: 'flacon';
  variants: FlaconVariant[];
}

export type Product = PerfumeProduct | FlaconProduct;

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  shop_name?: string;
  phone: string; 
  wilaya: string;
  commune?: string;
  role: 'admin' | 'customer';
  is_frozen: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_type: string;
  flacon_variant_id?: string;
  product_name_fr: string;
  product_name_ar: string;
  variant_label?: string;
  quantity_grams?: number;
  quantity_units?: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  is_registered_customer: boolean;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_phone?: string;
  guest_wilaya?: string;
  guest_commune?: string;
  total_amount: number;
  amount_paid: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  admin_notes?: string;
  invoice_generated?: boolean;
  invoice_data?: any;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string; // e.g., FAC-00123
  order_id: string;
  issue_date: string;
}
