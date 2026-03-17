-- ============================================
-- ADMIN RLS POLICIES - Complete Security Setup
-- ============================================
-- Run this to enable Row Level Security for all admin operations
-- Platform admins and seller admins get appropriate access

-- ============================================
-- PRODUCTS TABLE
-- ============================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Anyone can view active products (customer-facing)
CREATE POLICY "Anyone can view active products"
ON public.products
FOR SELECT
USING (is_active = true);

-- Admins can manage all products
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
-- PRODUCT VARIANTS TABLE
-- ============================================
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admins can manage variants" ON public.product_variants;

CREATE POLICY "Anyone can view variants"
ON public.product_variants
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage variants"
ON public.product_variants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- CATEGORIES TABLE
-- ============================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Anyone can view active categories"
ON public.categories
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- PRODUCT IMAGES TABLE
-- ============================================
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;

CREATE POLICY "Anyone can view product images"
ON public.product_images
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage product images"
ON public.product_images
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- DISCOUNTS TABLE
-- ============================================
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all discounts" ON public.discounts;
DROP POLICY IF EXISTS "Admins can manage discounts" ON public.discounts;

CREATE POLICY "Admins can view all discounts"
ON public.discounts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);

CREATE POLICY "Admins can manage discounts"
ON public.discounts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- PRODUCT REVIEWS TABLE
-- ============================================
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can edit own reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.product_reviews;

-- Anyone can view published reviews
CREATE POLICY "Anyone can view published reviews"
ON public.product_reviews
FOR SELECT
USING (is_published = true);

-- Logged-in users can create reviews
CREATE POLICY "Users can create reviews"
ON public.product_reviews
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND profile_id = auth.uid());

-- Users can edit their own reviews
CREATE POLICY "Users can edit own reviews"
ON public.product_reviews
FOR UPDATE
USING (profile_id = auth.uid());

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
ON public.product_reviews
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- SELLERS TABLE (Platform Admin Only)
-- ============================================
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active sellers" ON public.sellers;
DROP POLICY IF EXISTS "Platform admins can manage sellers" ON public.sellers;

CREATE POLICY "Anyone can view active sellers"
ON public.sellers
FOR SELECT
USING (is_active = true);

CREATE POLICY "Platform admins can manage sellers"
ON public.sellers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'platform_admin'
  )
);


-- ============================================
-- SELLER MEMBERS TABLE
-- ============================================
ALTER TABLE public.seller_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform admins can manage seller members" ON public.seller_members;

CREATE POLICY "Platform admins can manage seller members"
ON public.seller_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'platform_admin'
  )
);


-- ============================================
-- CUSTOMER UPLOADS TABLE
-- ============================================
ALTER TABLE public.customer_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own uploads" ON public.customer_uploads;
DROP POLICY IF EXISTS "Admins can view all uploads" ON public.customer_uploads;

CREATE POLICY "Users can manage own uploads"
ON public.customer_uploads
FOR ALL
USING (profile_id = auth.uid());

CREATE POLICY "Admins can view all uploads"
ON public.customer_uploads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- ADDRESSES TABLE
-- ============================================
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON public.addresses;

CREATE POLICY "Users can manage own addresses"
ON public.addresses
FOR ALL
USING (profile_id = auth.uid());

CREATE POLICY "Admins can view all addresses"
ON public.addresses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- SHIPPING METHODS TABLE
-- ============================================
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active shipping methods" ON public.shipping_methods;
DROP POLICY IF EXISTS "Admins can manage shipping methods" ON public.shipping_methods;

CREATE POLICY "Anyone can view active shipping methods"
ON public.shipping_methods
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage shipping methods"
ON public.shipping_methods
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- PAYMENT INTENTS & TRANSACTIONS
-- ============================================
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment intents" ON public.payment_intents;
DROP POLICY IF EXISTS "Admins can manage payment intents" ON public.payment_intents;
DROP POLICY IF EXISTS "Service can create payment intents" ON public.payment_intents;

DROP POLICY IF EXISTS "Users can view own payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Admins can manage payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Service can create payment transactions" ON public.payment_transactions;

-- Payment Intents
CREATE POLICY "Users can view own payment intents"
ON public.payment_intents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = payment_intents.order_id
    AND orders.profile_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage payment intents"
ON public.payment_intents
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);

CREATE POLICY "Service can create payment intents"
ON public.payment_intents
FOR INSERT
WITH CHECK (true);

-- Payment Transactions
CREATE POLICY "Users can view own payment transactions"
ON public.payment_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = payment_transactions.order_id
    AND orders.profile_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage payment transactions"
ON public.payment_transactions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);

CREATE POLICY "Service can create payment transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (true);


-- ============================================
-- BANNERS TABLE
-- ============================================
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;

CREATE POLICY "Anyone can view active banners"
ON public.banners
FOR SELECT
USING (
  is_active = true
  AND (starts_at IS NULL OR starts_at <= now())
  AND (ends_at IS NULL OR ends_at >= now())
);

CREATE POLICY "Admins can manage banners"
ON public.banners
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;

CREATE POLICY "Users can manage own notifications"
ON public.notifications
FOR ALL
USING (profile_id = auth.uid());


-- ============================================
-- ORDER STATUS HISTORY
-- ============================================
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view and create status history" ON public.order_status_history;

CREATE POLICY "Admins can view and create status history"
ON public.order_status_history
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('platform_admin', 'seller_admin')
  )
);


-- ============================================
-- VERIFY POLICIES
-- ============================================
SELECT 
  schemaname,
  tablename, 
  policyname,
  cmd,
  qual as "using_clause"
FROM pg_policies
WHERE tablename IN (
  'products', 'product_variants', 'product_images', 'categories',
  'discounts', 'product_reviews', 'sellers', 'seller_members',
  'customer_uploads', 'addresses', 'shipping_methods',
  'payment_intents', 'payment_transactions', 'banners',
  'notifications', 'order_status_history'
)
ORDER BY tablename, policyname;


-- ============================================
-- SUMMARY
-- ============================================
-- ✅ Products: Admins can manage, customers can view active
-- ✅ Categories: Admins can manage, customers can view active
-- ✅ Discounts: Admins only
-- ✅ Reviews: Customers can create/edit own, admins can manage all
-- ✅ Sellers: Platform admins only
-- ✅ Orders: Already configured in RUN-ALL-FIXES-SIMPLE.sql
-- ✅ Carts: Already configured in RUN-ALL-FIXES-SIMPLE.sql
-- ✅ Payments: Admins can manage, users can view own
-- ✅ Uploads: Users can manage own, admins can view all
-- ✅ Addresses: Users can manage own, admins can view all
-- ✅ Shipping: Admins can manage, customers can view active
-- ✅ Banners: Admins can manage, customers can view active
-- ✅ Notifications: Users can manage own

-- NOTE: Make sure to also run RUN-ALL-FIXES-SIMPLE.sql for orders, carts, and cart_items policies!
