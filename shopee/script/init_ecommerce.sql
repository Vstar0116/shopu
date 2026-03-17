-- Initial e-commerce schema for Next.js + Supabase backend
-- Generated from plan: next-supabase-ecommerce-schema

-- Enable extension for UUID generation (Supabase has this available)
create extension if not exists "pgcrypto";

--------------------------------------------------------------------------------
-- ENUM TYPES
--------------------------------------------------------------------------------

-- User roles
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('customer', 'seller_admin', 'platform_admin');
  end if;
end $$;

-- Seller member roles
do $$
begin
  if not exists (select 1 from pg_type where typname = 'seller_member_role') then
    create type seller_member_role as enum ('owner', 'manager', 'staff');
  end if;
end $$;

-- Customization option input types
do $$
begin
  if not exists (select 1 from pg_type where typname = 'customization_option_type') then
    create type customization_option_type as enum ('text', 'textarea', 'select', 'multi_select', 'file');
  end if;
end $$;

-- Cart status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'cart_status') then
    create type cart_status as enum ('active', 'converted', 'abandoned');
  end if;
end $$;

-- Order status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum (
      'pending_payment',
      'payment_failed',
      'processing',
      'artwork_in_progress',
      'awaiting_customer_approval',
      'ready_to_ship',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    );
  end if;
end $$;

-- Payment method
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type payment_method as enum ('razorpay', 'cod');
  end if;
end $$;

-- Payment status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
  end if;
end $$;

-- Artwork approval channel
do $$
begin
  if not exists (select 1 from pg_type where typname = 'artwork_approval_channel') then
    create type artwork_approval_channel as enum ('whatsapp', 'website');
  end if;
end $$;

-- Artwork approval status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'artwork_approval_status') then
    create type artwork_approval_status as enum ('pending', 'approved', 'changes_requested');
  end if;
end $$;

-- Payment intent status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_intent_status') then
    create type payment_intent_status as enum ('created', 'attempted', 'succeeded', 'failed');
  end if;
end $$;

-- Payment transaction status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_transaction_status') then
    create type payment_transaction_status as enum ('pending', 'confirmed', 'failed', 'refunded');
  end if;
end $$;

-- Discount type
do $$
begin
  if not exists (select 1 from pg_type where typname = 'discount_type') then
    create type discount_type as enum ('percentage', 'fixed');
  end if;
end $$;

-- Shipping zone type
do $$
begin
  if not exists (select 1 from pg_type where typname = 'shipping_zone_type') then
    create type shipping_zone_type as enum ('postal_list', 'radius', 'polygon');
  end if;
end $$;

-- Bundle type
do $$
begin
  if not exists (select 1 from pg_type where typname = 'bundle_type') then
    create type bundle_type as enum ('fixed', 'discounted_set');
  end if;
end $$;

--------------------------------------------------------------------------------
-- 2. CORE IDENTITY & ROLES TABLES
--------------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid() references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  default_address_id bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sellers (
  id bigserial primary key,
  name text not null,
  slug text not null,
  description text,
  logo_url text,
  cover_image_url text,
  contact_email text,
  contact_phone text,
  address_line1 text,
  city text,
  state text,
  country text,
  pincode text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists sellers_slug_key on public.sellers (slug);

create table if not exists public.seller_members (
  id bigserial primary key,
  seller_id bigint not null references public.sellers(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role seller_member_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique (seller_id, profile_id)
);

--------------------------------------------------------------------------------
-- 3. CATALOG: CATEGORIES, PRODUCTS, VARIANTS (SEO-READY)
--------------------------------------------------------------------------------

create table if not exists public.categories (
  id bigserial primary key,
  parent_id bigint references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order int,
  seo_title text,
  seo_description text,
  seo_keywords text,
  seo_og_image_url text,
  seo_schema jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug)
);

create table if not exists public.product_types (
  id bigserial primary key,
  code text not null unique,
  name text not null,
  description text
);

create table if not exists public.products (
  id bigserial primary key,
  seller_id bigint not null references public.sellers(id) on delete cascade,
  product_type_id bigint references public.product_types(id) on delete set null,
  category_id bigint references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  short_description text,
  long_description text,
  is_customizable boolean not null default false,
  base_price numeric(12,2),
  currency text not null default 'INR',
  is_active boolean not null default true,
  min_processing_days int,
  max_processing_days int,
  seo_title text,
  seo_description text,
  seo_keywords text,
  seo_og_image_url text,
  seo_schema jsonb,
  canonical_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, slug)
);

create index if not exists products_slug_idx on public.products (slug);

create table if not exists public.product_variants (
  id bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  sku text,
  title text not null,
  attributes jsonb,
  price numeric(12,2) not null,
  compare_at_price numeric(12,2),
  stock_quantity int,
  is_active boolean not null default true
);

create index if not exists product_variants_product_id_idx on public.product_variants (product_id);

--------------------------------------------------------------------------------
-- 3.a COMBOS (BUNDLES) & PRODUCT ADDONS
--------------------------------------------------------------------------------

create table if not exists public.product_bundles (
  id bigserial primary key,
  seller_id bigint not null references public.sellers(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  image_url text,
  is_active boolean not null default true,
  bundle_type bundle_type not null default 'fixed',
  price numeric(12,2),
  discount_percentage numeric(5,2),
  seo_title text,
  seo_description text,
  seo_og_image_url text,
  seo_schema jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, slug)
);

create table if not exists public.product_bundle_items (
  id bigserial primary key,
  bundle_id bigint not null references public.product_bundles(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  variant_id bigint references public.product_variants(id) on delete set null,
  quantity int not null default 1,
  is_required boolean not null default true,
  sort_order int
);

create table if not exists public.product_addons (
  id bigserial primary key,
  seller_id bigint not null references public.sellers(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null,
  max_quantity_per_item int,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_addon_links (
  id bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  addon_id bigint not null references public.product_addons(id) on delete cascade,
  is_required boolean not null default false,
  sort_order int,
  unique (product_id, addon_id)
);

--------------------------------------------------------------------------------
-- 4. MEDIA, ARTWORK FILES & CUSTOMIZATIONS
--------------------------------------------------------------------------------

create table if not exists public.product_images (
  id bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_sort_idx
  on public.product_images (product_id, sort_order);

create table if not exists public.customization_options (
  id bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  key text not null,
  label text not null,
  type customization_option_type not null,
  required boolean not null default false,
  config jsonb,
  sort_order int
);

create table if not exists public.customer_uploads (
  id bigserial primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  file_url text,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.artwork_files (
  id bigserial primary key,
  order_item_id bigint not null,
  version int not null default 1,
  storage_path text not null,
  file_url text,
  notes text,
  created_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 5. CART & CHECKOUT
--------------------------------------------------------------------------------

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  status cart_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id bigserial primary key,
  cart_id uuid not null references public.carts(id) on delete cascade,
  bundle_id bigint references public.product_bundles(id) on delete set null,
  product_id bigint not null references public.products(id) on delete cascade,
  variant_id bigint references public.product_variants(id) on delete set null,
  quantity int not null default 1,
  unit_price_snapshot numeric(12,2) not null,
  customization_data jsonb,
  customer_upload_id bigint references public.customer_uploads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_item_addons (
  id bigserial primary key,
  cart_item_id bigint not null references public.cart_items(id) on delete cascade,
  addon_id bigint not null references public.product_addons(id) on delete restrict,
  name_snapshot text not null,
  unit_price_snapshot numeric(12,2) not null,
  quantity int not null default 1,
  total_price numeric(12,2) not null
);

--------------------------------------------------------------------------------
-- 6. ADDRESSES & SHIPPING (CITY + LAT/LONG COVERAGE)
--------------------------------------------------------------------------------

create table if not exists public.addresses (
  id bigserial primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  landmark text,
  city text not null,
  state text not null,
  country text not null,
  pincode text not null,
  is_default_shipping boolean not null default false,
  is_default_billing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_default_address_id_fkey
  foreign key (default_address_id) references public.addresses(id) on delete set null;

create table if not exists public.shipping_methods (
  id bigserial primary key,
  seller_id bigint references public.sellers(id) on delete cascade,
  name text not null,
  description text,
  base_fee numeric(12,2) not null default 0,
  estimated_min_days int,
  estimated_max_days int,
  is_active boolean not null default true
);

create table if not exists public.shipping_zones (
  id bigserial primary key,
  name text not null,
  seller_id bigint references public.sellers(id) on delete cascade,
  type shipping_zone_type not null default 'postal_list',
  postal_codes jsonb,
  center_lat numeric,
  center_lng numeric,
  radius_km numeric,
  geojson jsonb,
  is_quick_delivery boolean not null default false,
  is_active boolean not null default true
);

create index if not exists shipping_zones_type_quick_idx
  on public.shipping_zones (type, is_quick_delivery);

create table if not exists public.product_shipping_areas (
  id bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  shipping_zone_id bigint not null references public.shipping_zones(id) on delete cascade,
  is_allowed boolean not null default true,
  is_quick_only boolean not null default false,
  unique (product_id, shipping_zone_id)
);

--------------------------------------------------------------------------------
-- 7. ORDERS & ORDER ITEMS
--------------------------------------------------------------------------------

create table if not exists public.orders (
  id bigserial primary key,
  order_number text not null,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  seller_id bigint not null references public.sellers(id) on delete restrict,
  status order_status not null default 'pending_payment',
  subtotal_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'INR',
  payment_method payment_method,
  payment_status payment_status not null default 'pending',
  shipping_address_snapshot jsonb not null,
  billing_address_snapshot jsonb,
  shipping_method_id bigint references public.shipping_methods(id) on delete set null,
  placed_at timestamptz not null default now(),
  paid_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_number)
);

create index if not exists orders_profile_id_idx on public.orders (profile_id);
create index if not exists orders_seller_status_idx on public.orders (seller_id, status);

create table if not exists public.order_items (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  bundle_id bigint references public.product_bundles(id) on delete set null,
  product_id bigint not null references public.products(id) on delete restrict,
  variant_id bigint references public.product_variants(id) on delete set null,
  product_name_snapshot text not null,
  variant_title_snapshot text,
  quantity int not null default 1,
  unit_price numeric(12,2) not null,
  total_price numeric(12,2) not null,
  customization_data jsonb,
  customer_upload_id bigint references public.customer_uploads(id) on delete set null,
  status order_status not null default 'processing'
);

alter table public.artwork_files
  add constraint artwork_files_order_item_id_fkey
  foreign key (order_item_id) references public.order_items(id) on delete cascade;

create table if not exists public.order_item_addons (
  id bigserial primary key,
  order_item_id bigint not null references public.order_items(id) on delete cascade,
  addon_id bigint references public.product_addons(id) on delete set null,
  name_snapshot text not null,
  unit_price numeric(12,2) not null,
  quantity int not null default 1,
  total_price numeric(12,2) not null
);

--------------------------------------------------------------------------------
-- 8. ARTWORK APPROVAL WORKFLOW
--------------------------------------------------------------------------------

create table if not exists public.artwork_approvals (
  id bigserial primary key,
  order_item_id bigint not null references public.order_items(id) on delete cascade,
  artwork_file_id bigint not null references public.artwork_files(id) on delete cascade,
  approval_channel artwork_approval_channel not null,
  status artwork_approval_status not null default 'pending',
  customer_comment text,
  designer_comment text,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

--------------------------------------------------------------------------------
-- 9. PAYMENTS (RAZORPAY + COD)
--------------------------------------------------------------------------------

create table if not exists public.payment_intents (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  provider text not null default 'razorpay',
  provider_order_id text not null,
  amount numeric(12,2) not null,
  currency text not null default 'INR',
  status payment_intent_status not null default 'created',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_order_id)
);

create index if not exists payment_intents_order_id_idx on public.payment_intents (order_id);

create table if not exists public.payment_transactions (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  provider_signature text,
  status payment_transaction_status not null default 'pending',
  amount numeric(12,2) not null,
  currency text not null default 'INR',
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  unique (provider_payment_id)
);

create index if not exists payment_transactions_order_id_idx on public.payment_transactions (order_id);

--------------------------------------------------------------------------------
-- 10. DISCOUNTS, COUPONS & FLASH SALES
--------------------------------------------------------------------------------

create table if not exists public.discounts (
  id bigserial primary key,
  code text not null,
  description text,
  type discount_type not null,
  value numeric(12,2) not null,
  min_order_amount numeric(12,2),
  max_uses_total int,
  max_uses_per_user int,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (code)
);

create table if not exists public.discount_applications (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  discount_id bigint not null references public.discounts(id) on delete restrict,
  discount_amount numeric(12,2) not null
);

--------------------------------------------------------------------------------
-- 11. REVIEWS & RATINGS
--------------------------------------------------------------------------------

create table if not exists public.product_reviews (
  id bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  order_id bigint references public.orders(id) on delete set null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 12. WISHLISTS & SAVED ITEMS
--------------------------------------------------------------------------------

create table if not exists public.wishlists (
  id bigserial primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id bigserial primary key,
  wishlist_id bigint not null references public.wishlists(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  variant_id bigint references public.product_variants(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id, variant_id)
);

--------------------------------------------------------------------------------
-- 13. CONTENT, SEO & MARKETING
--------------------------------------------------------------------------------

create table if not exists public.banners (
  id bigserial primary key,
  title text not null,
  subtitle text,
  image_url text not null,
  cta_label text,
  cta_url text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz
);

create table if not exists public.blog_posts (
  id bigserial primary key,
  slug text not null,
  title text not null,
  excerpt text,
  content text,
  cover_image_url text,
  author_id uuid references public.profiles(id) on delete set null,
  seo_title text,
  seo_description text,
  seo_og_image_url text,
  seo_schema jsonb,
  canonical_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug)
);

create table if not exists public.seo_settings (
  id bigserial primary key,
  site_name text not null,
  default_title_suffix text,
  default_meta_description text,
  default_og_image_url text,
  twitter_handle text,
  robots_txt text,
  extra_meta_tags jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 14. RLS-RELATED SUPPORT TABLES (NO POLICIES HERE, JUST STRUCTURE)
--------------------------------------------------------------------------------

create table if not exists public.order_status_history (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.redirects (
  id bigserial primary key,
  from_path text not null,
  to_path text not null,
  http_status int not null default 301,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (from_path)
);

create table if not exists public.notifications (
  id bigserial primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  payload jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

--------------------------------------------------------------------------------
-- INDEXES ALREADY ADDED ABOVE WHERE MOST RELEVANT
-- Additional helpful indexes can be appended here as needed.
--------------------------------------------------------------------------------

