# Database Schema Documentation

E-commerce platform database schema for Supabase PostgreSQL.

---

## Core Tables

### 1. Profiles
User profiles linked to Supabase Auth.

```sql
public.profiles (
  id uuid PRIMARY KEY → auth.users(id)
  full_name text
  phone text
  avatar_url text
  role user_role NOT NULL DEFAULT 'customer'
  default_address_id bigint
  created_at timestamptz
  updated_at timestamptz
)
```

**Roles:**
- `customer` - Regular buyers
- `seller_admin` - Seller account managers
- `platform_admin` - Full admin access

---

### 2. Products
Main product catalog.

```sql
public.products (
  id bigserial PRIMARY KEY
  seller_id bigint → sellers(id)
  name text NOT NULL
  slug text UNIQUE NOT NULL
  description text
  base_price numeric(12,2)
  currency text DEFAULT 'INR'
  sku text
  images jsonb (array of image URLs)
  is_active boolean DEFAULT true
  metadata jsonb
  created_at timestamptz
  updated_at timestamptz
)
```

---

### 3. Product Variants
Size, color, frame options for products.

```sql
public.product_variants (
  id bigserial PRIMARY KEY
  product_id bigint → products(id)
  title text NOT NULL (e.g., "A4 - Framed")
  sku text
  price_adjustment numeric(12,2) DEFAULT 0
  is_available boolean DEFAULT true
  display_order int
  created_at timestamptz
)
```

---

### 4. Carts
Shopping carts (one active cart per user/session).

```sql
public.carts (
  id bigserial PRIMARY KEY
  profile_id uuid → profiles(id) [NULLABLE]
  session_token text (for guest users)
  status cart_status DEFAULT 'active'
  created_at timestamptz
  updated_at timestamptz
)
```

**Status:** `active`, `converted`, `abandoned`

---

### 5. Cart Items
Items in shopping carts.

```sql
public.cart_items (
  id bigserial PRIMARY KEY
  cart_id bigint → carts(id)
  product_id bigint → products(id)
  variant_id bigint → product_variants(id)
  quantity int NOT NULL
  unit_price_snapshot numeric(12,2)
  customization_data jsonb
  added_at timestamptz
)
```

---

### 6. Orders
Customer orders.

```sql
public.orders (
  id bigserial PRIMARY KEY
  order_number text UNIQUE NOT NULL
  profile_id uuid → profiles(id) [NULLABLE] ← Guest checkout support
  seller_id bigint → sellers(id)
  status order_status DEFAULT 'pending_payment'
  subtotal_amount numeric(12,2)
  discount_amount numeric(12,2)
  shipping_amount numeric(12,2)
  tax_amount numeric(12,2)
  total_amount numeric(12,2)
  currency text DEFAULT 'INR'
  payment_method payment_method (razorpay, cod)
  payment_status payment_status (pending, paid, failed, refunded)
  shipping_address_snapshot jsonb NOT NULL
  billing_address_snapshot jsonb
  placed_at timestamptz
  paid_at timestamptz
  delivered_at timestamptz
  cancelled_at timestamptz
  created_at timestamptz
  updated_at timestamptz
)
```

**Order Status Flow:**
1. `pending_payment` - Waiting for payment
2. `processing` - Payment received, preparing order
3. `artwork_in_progress` - Custom artwork being created
4. `awaiting_customer_approval` - Artwork sent for approval
5. `ready_to_ship` - Order packed
6. `shipped` - Order dispatched
7. `delivered` - Order delivered
8. `cancelled` / `refunded` - Order cancelled

---

### 7. Order Items
Line items in orders.

```sql
public.order_items (
  id bigserial PRIMARY KEY
  order_id bigint → orders(id)
  product_id bigint → products(id)
  variant_id bigint → product_variants(id)
  product_name_snapshot text
  variant_title_snapshot text
  quantity int NOT NULL
  unit_price numeric(12,2)
  total_price numeric(12,2)
  customization_data_snapshot jsonb
  artwork_urls jsonb
)
```

---

### 8. Categories
Product categories.

```sql
public.categories (
  id bigserial PRIMARY KEY
  name text NOT NULL
  slug text UNIQUE NOT NULL
  description text
  parent_category_id bigint → categories(id)
  image_url text
  is_active boolean DEFAULT true
  display_order int
  created_at timestamptz
)
```

---

### 9. Sellers
Seller accounts/stores.

```sql
public.sellers (
  id bigserial PRIMARY KEY
  name text NOT NULL
  slug text UNIQUE NOT NULL
  description text
  logo_url text
  cover_image_url text
  contact_email text
  contact_phone text
  address_line1 text
  city text
  state text
  country text
  pincode text
  is_active boolean DEFAULT true
  created_at timestamptz
  updated_at timestamptz
)
```

---

## Key Schema Changes

### ✅ Profile ID Nullable in Orders
**Changed:** `profile_id` from `NOT NULL` to `NULLABLE`

**Reason:** Support guest checkout (users don't need to login)

**Migration:**
```sql
ALTER TABLE public.orders ALTER COLUMN profile_id DROP NOT NULL;
```

---

## Relationships

```
auth.users
  ↓
profiles (1:1)
  ↓
carts (1:many) → cart_items (1:many) → products
  ↓                                        ↓
orders (1:many) → order_items (1:many) → product_variants
```

---

## Indexes

Key indexes for performance:

```sql
-- Profiles
CREATE INDEX profiles_role_idx ON profiles(role);

-- Products
CREATE INDEX products_seller_id_idx ON products(seller_id);
CREATE INDEX products_slug_idx ON products(slug);

-- Orders
CREATE INDEX orders_profile_id_idx ON orders(profile_id);
CREATE INDEX orders_seller_status_idx ON orders(seller_id, status);
CREATE INDEX orders_order_number_idx ON orders(order_number);

-- Carts
CREATE INDEX carts_profile_id_idx ON carts(profile_id);
CREATE INDEX carts_session_token_idx ON carts(session_token);
```

---

## Important Notes

### Guest Checkout
- `orders.profile_id` can be NULL for guest users
- Guest users tracked via session_token in carts
- Shipping info stored in `shipping_address_snapshot`

### Authentication
- All users in `auth.users` (Supabase Auth)
- Extended user data in `public.profiles`
- Role-based access control via `profiles.role`

### Prices
- All prices stored as `numeric(12,2)` (up to 10 digits + 2 decimals)
- Default currency: `INR`
- Prices snapshot in order_items for historical accuracy

---

**Schema Version:** 1.1  
**Last Updated:** 2024-02-11  
**Source:** `init_ecommerce.sql`
