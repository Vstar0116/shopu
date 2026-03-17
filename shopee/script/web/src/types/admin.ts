// Admin type definitions based on database schema

export interface Product {
  id: number;
  seller_id: number;
  product_type_id: number | null;
  category_id: number | null;
  name: string;
  slug: string;
  short_description: string | null;
  long_description: string | null;
  is_customizable: boolean;
  base_price: number | null;
  currency: string;
  is_active: boolean;
  min_processing_days: number | null;
  max_processing_days: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  seo_og_image_url: string | null;
  seo_schema: any;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string | null;
  title: string;
  attributes: any;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number | null;
  is_active: boolean;
}

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  seo_og_image_url: string | null;
  seo_schema: any;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  profile_id: string | null;
  seller_id: number;
  status: OrderStatus;
  subtotal_amount: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_method: 'razorpay' | 'cod' | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address_snapshot: any;
  billing_address_snapshot: any;
  shipping_method_id: number | null;
  placed_at: string;
  paid_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_failed'
  | 'processing'
  | 'artwork_in_progress'
  | 'awaiting_customer_approval'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Customer {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'seller_admin' | 'platform_admin';
  default_address_id: number | null;
  created_at: string;
  updated_at: string;
  email?: string;
}

export interface Seller {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Discount {
  id: number;
  code: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number | null;
  max_uses_total: number | null;
  max_uses_per_user: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  order_id: number | null;
  profile_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  monthOrders: number;
  monthRevenue: number;
}

export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}
