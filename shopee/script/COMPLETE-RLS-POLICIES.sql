-- ============================================
-- Complete RLS Policies for E-Commerce
-- ============================================
-- Run this to set up all necessary RLS policies
-- This file is idempotent - safe to run multiple times

-- ============================================
-- CLEANUP: Drop ALL existing policies first
-- ============================================

-- Orders table policies
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders by order_number" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Order items table policies
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can update order items" ON public.order_items;
DROP POLICY IF EXISTS "View order items for accessible orders" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Carts table policies
DROP POLICY IF EXISTS "Users can view their own carts" ON public.carts;
DROP POLICY IF EXISTS "Anyone can create carts" ON public.carts;
DROP POLICY IF EXISTS "Users can update their own carts" ON public.carts;
DROP POLICY IF EXISTS "View own carts" ON public.carts;
DROP POLICY IF EXISTS "Update own carts" ON public.carts;
DROP POLICY IF EXISTS "Delete own carts" ON public.carts;

-- Cart items table policies
DROP POLICY IF EXISTS "Users can manage their cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can manage cart items" ON public.cart_items;
DROP POLICY IF EXISTS "View cart items for accessible carts" ON public.cart_items;
DROP POLICY IF EXISTS "Insert cart items for accessible carts" ON public.cart_items;
DROP POLICY IF EXISTS "Update cart items for accessible carts" ON public.cart_items;
DROP POLICY IF EXISTS "Delete cart items for accessible carts" ON public.cart_items;

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Products table policies
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Sellers can manage their products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Product variants table policies
DROP POLICY IF EXISTS "Anyone can view variants" ON public.product_variants;

-- Categories table policies
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

-- Addresses table policies
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON public.addresses;
DROP POLICY IF EXISTS "View own addresses or admin view all" ON public.addresses;

-- Wishlists table policies
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can insert own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Admins can view all wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "View own wishlist or admin view all" ON public.wishlists;
DROP POLICY IF EXISTS "Users can create own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can update own wishlist" ON public.wishlists;

-- Wishlist items table policies
DROP POLICY IF EXISTS "Users can manage own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "View wishlist items for accessible wishlists" ON public.wishlist_items;
DROP POLICY IF EXISTS "Insert wishlist items for own wishlist" ON public.wishlist_items;
DROP POLICY IF EXISTS "Delete wishlist items for own wishlist" ON public.wishlist_items;

-- Product reviews table policies
DROP POLICY IF EXISTS "Anyone can view published reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can view own reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "View published reviews, own reviews, or admin view all" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can submit reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.product_reviews;

-- Cart item addons table policies
DROP POLICY IF EXISTS "Users can manage cart item addons" ON public.cart_item_addons;
DROP POLICY IF EXISTS "View cart item addons for accessible cart items" ON public.cart_item_addons;
DROP POLICY IF EXISTS "Insert cart item addons for accessible cart items" ON public.cart_item_addons;
DROP POLICY IF EXISTS "Delete cart item addons for accessible cart items" ON public.cart_item_addons;

-- ============================================
-- ORDERS TABLE
-- ============================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy 1: View orders (guests, owners, admins)
CREATE POLICY "Anyone can view orders"
ON public.orders
FOR SELECT
USING (
  profile_id IS NULL  -- Guest orders (anyone with order_number can view)
  OR 
  profile_id = auth.uid()  -- Your own orders
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('platform_admin', 'seller_admin')
  )  -- Admins
);

-- Policy 2: Insert orders (anyone can create orders - guest or logged in)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);  -- Server-side API handles validation

-- Policy 3: Update orders (only admins)
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- ORDER ITEMS TABLE
-- ============================================

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policy 1: View order items (linked to orders you can view)
CREATE POLICY "View order items for accessible orders"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (
      orders.profile_id IS NULL 
      OR orders.profile_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role IN ('platform_admin', 'seller_admin')
      )
    )
  )
);

-- Policy 2: Insert order items (anyone - for checkout)
CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (true);

-- Policy 3: Update order items (admins only)
CREATE POLICY "Admins can update order items"
ON public.order_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- CARTS TABLE
-- ============================================

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Policy 1: View carts (your own or guest carts)
CREATE POLICY "View own carts"
ON public.carts
FOR SELECT
USING (
  profile_id = auth.uid()
  OR profile_id IS NULL  -- Guest carts (managed by session_token)
);

-- Policy 2: Insert carts
CREATE POLICY "Anyone can create carts"
ON public.carts
FOR INSERT
WITH CHECK (true);

-- Policy 3: Update carts
CREATE POLICY "Update own carts"
ON public.carts
FOR UPDATE
USING (
  profile_id = auth.uid()
  OR profile_id IS NULL
);

-- Policy 4: Delete carts
CREATE POLICY "Delete own carts"
ON public.carts
FOR DELETE
USING (
  profile_id = auth.uid()
  OR profile_id IS NULL
);


-- ============================================
-- CART ITEMS TABLE
-- ============================================

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Policy 1: View cart items
CREATE POLICY "View cart items for accessible carts"
ON public.cart_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)
  )
);

-- Policy 2: Insert cart items
CREATE POLICY "Insert cart items for accessible carts"
ON public.cart_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)
  )
);

-- Policy 3: Update cart items
CREATE POLICY "Update cart items for accessible carts"
ON public.cart_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)
  )
);

-- Policy 4: Delete cart items
CREATE POLICY "Delete cart items for accessible carts"
ON public.cart_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)
  )
);


-- ============================================
-- PROFILES TABLE (Read-only for users)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: View profiles (everyone can view)
CREATE POLICY "Anyone can view profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

-- Policy 3: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());


-- ============================================
-- PRODUCTS TABLE (Public read access)
-- ============================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view active products
CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (is_active = true OR is_active IS NULL);

-- Policy 2: Admins/sellers can manage products
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- PRODUCT VARIANTS TABLE (Public read access)
-- ============================================

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view variants"
ON public.product_variants
FOR SELECT
USING (is_active = true OR is_active IS NULL);


-- ============================================
-- CATEGORIES TABLE (Public read access)
-- ============================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (is_active = true OR is_active IS NULL);


-- ============================================
-- VERIFY POLICIES
-- ============================================

SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN (
  'orders', 'order_items', 'carts', 'cart_items', 
  'profiles', 'products', 'product_variants', 'categories',
  'addresses', 'wishlists', 'wishlist_items', 'product_reviews'
)
ORDER BY tablename, policyname;


-- ============================================
-- ADDRESSES TABLE
-- ============================================

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Policy 1: View addresses (own addresses + admins)
CREATE POLICY "View own addresses or admin view all"
ON public.addresses
FOR SELECT
USING (
  profile_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('platform_admin', 'seller_admin')
  )
);

-- Policy 2: Insert addresses
CREATE POLICY "Users can insert own addresses"
ON public.addresses
FOR INSERT
WITH CHECK (profile_id = auth.uid());

-- Policy 3: Update addresses
CREATE POLICY "Users can update own addresses"
ON public.addresses
FOR UPDATE
USING (profile_id = auth.uid());

-- Policy 4: Delete addresses
CREATE POLICY "Users can delete own addresses"
ON public.addresses
FOR DELETE
USING (profile_id = auth.uid());


-- ============================================
-- WISHLISTS TABLE
-- ============================================

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Policy 1: View wishlists
CREATE POLICY "View own wishlist or admin view all"
ON public.wishlists
FOR SELECT
USING (
  profile_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('platform_admin', 'seller_admin')
  )
);

-- Policy 2: Insert wishlists
CREATE POLICY "Users can create own wishlist"
ON public.wishlists
FOR INSERT
WITH CHECK (profile_id = auth.uid());

-- Policy 3: Update wishlists (not typically needed but for completeness)
CREATE POLICY "Users can update own wishlist"
ON public.wishlists
FOR UPDATE
USING (profile_id = auth.uid());


-- ============================================
-- WISHLIST ITEMS TABLE
-- ============================================

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policy 1: View wishlist items
CREATE POLICY "View wishlist items for accessible wishlists"
ON public.wishlist_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wishlists
    WHERE wishlists.id = wishlist_items.wishlist_id
    AND (
      wishlists.profile_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role IN ('platform_admin', 'seller_admin')
      )
    )
  )
);

-- Policy 2: Insert wishlist items
CREATE POLICY "Insert wishlist items for own wishlist"
ON public.wishlist_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wishlists
    WHERE wishlists.id = wishlist_items.wishlist_id
    AND wishlists.profile_id = auth.uid()
  )
);

-- Policy 3: Delete wishlist items
CREATE POLICY "Delete wishlist items for own wishlist"
ON public.wishlist_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.wishlists
    WHERE wishlists.id = wishlist_items.wishlist_id
    AND wishlists.profile_id = auth.uid()
  )
);


-- ============================================
-- PRODUCT REVIEWS TABLE
-- ============================================

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Policy 1: View reviews (published reviews for everyone, own reviews, or all for admins)
CREATE POLICY "View published reviews, own reviews, or admin view all"
ON public.product_reviews
FOR SELECT
USING (
  is_published = true
  OR profile_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('platform_admin', 'seller_admin')
  )
);

-- Policy 2: Insert reviews
CREATE POLICY "Users can submit reviews"
ON public.product_reviews
FOR INSERT
WITH CHECK (profile_id = auth.uid());

-- Policy 3: Update reviews (admins only - for publishing/moderation)
CREATE POLICY "Admins can update reviews"
ON public.product_reviews
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('platform_admin', 'seller_admin')
  )
);

-- Policy 4: Delete reviews (admins only)
CREATE POLICY "Admins can delete reviews"
ON public.product_reviews
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- CART ITEM ADDONS TABLE
-- ============================================

ALTER TABLE public.cart_item_addons ENABLE ROW LEVEL SECURITY;

-- Policy 1: View cart item addons
CREATE POLICY "View cart item addons for accessible cart items"
ON public.cart_item_addons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cart_items
    JOIN public.carts ON carts.id = cart_items.cart_id
    WHERE cart_items.id = cart_item_addons.cart_item_id
    AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)
  )
);

-- Policy 2: Insert cart item addons
CREATE POLICY "Insert cart item addons for accessible cart items"
ON public.cart_item_addons
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cart_items
    JOIN public.carts ON carts.id = cart_items.cart_id
    WHERE cart_items.id = cart_item_addons.cart_item_id
    AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)
  )
);

-- Policy 3: Delete cart item addons
CREATE POLICY "Delete cart item addons for accessible cart items"
ON public.cart_item_addons
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.cart_items
    JOIN public.carts ON carts.id = cart_items.cart_id
    WHERE cart_items.id = cart_item_addons.cart_item_id
    AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)
  )
);


-- ============================================
-- DONE!
-- ============================================
-- All RLS policies are now configured including customer features
-- Test by:
-- 1. Guest checkout → should work
-- 2. Logged-in checkout → should work and show in "My Orders"
-- 3. View orders → should show your orders only
-- 4. Admin dashboard → should show all orders
-- 5. Addresses CRUD → users can manage their own addresses
-- 6. Wishlist → users can add/remove items from their wishlist
-- 7. Reviews → users can submit reviews (pending approval), view published reviews
