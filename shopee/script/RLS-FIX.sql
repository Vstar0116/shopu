-- ============================================
-- FIX: Enable Public Access to Required Tables
-- ============================================
-- Run this in Supabase SQL Editor to allow anon key to read data

-- 1. DISABLE RLS on public catalog tables (for now)
-- This allows anyone to read products, categories, etc.

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customization_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings DISABLE ROW LEVEL SECURITY;

-- 2. OR Enable RLS with public read policies (more secure)
-- Comment out the DISABLE commands above and use these instead:

/*
-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to READ products and categories
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view product variants" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view product images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view customization options" ON public.customization_options
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view SEO settings" ON public.seo_settings
  FOR SELECT USING (true);
*/

-- 3. Cart and Order tables need user-specific policies
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own carts
CREATE POLICY "Users can view their own carts" ON public.carts
  FOR SELECT USING (true); -- Allow anonymous carts

CREATE POLICY "Users can insert their own carts" ON public.carts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own carts" ON public.carts
  FOR UPDATE USING (true);

-- Allow users to manage their own cart items
CREATE POLICY "Users can view cart items" ON public.cart_items
  FOR SELECT USING (true);

CREATE POLICY "Users can insert cart items" ON public.cart_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update cart items" ON public.cart_items
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete cart items" ON public.cart_items
  FOR DELETE USING (true);

-- Allow users to view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = profile_id OR auth.uid() IS NULL
  );

CREATE POLICY "Users can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Allow viewing order items for orders user can see
CREATE POLICY "Users can view order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.profile_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

CREATE POLICY "System can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- 4. Profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
