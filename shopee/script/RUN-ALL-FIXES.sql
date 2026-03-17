-- ============================================
-- ALL REQUIRED FIXES - Run in Supabase SQL Editor
-- ============================================
-- This file combines all necessary database fixes
-- Run this ONCE to fix all current issues

-- ============================================
-- FIX 1: Allow Guest Checkout
-- ============================================
ALTER TABLE public.orders 
ALTER COLUMN profile_id DROP NOT NULL;


-- ============================================
-- FIX 2: Complete RLS Policies
-- ============================================
-- For detailed policies, see COMPLETE-RLS-POLICIES.sql
-- Below is the essential subset:

-- ORDERS TABLE
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT
USING (profile_id IS NULL OR profile_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('platform_admin', 'seller_admin')
));

CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('platform_admin', 'seller_admin')
));

-- ORDER ITEMS TABLE
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View order items for accessible orders" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "View order items for accessible orders" ON public.order_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id
  AND (orders.profile_id IS NULL OR orders.profile_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('platform_admin', 'seller_admin')
  ))
));

CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- CARTS & CART ITEMS
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View own carts" ON public.carts;
DROP POLICY IF EXISTS "Anyone can create carts" ON public.carts;
DROP POLICY IF EXISTS "Update own carts" ON public.carts;
DROP POLICY IF EXISTS "Delete own carts" ON public.carts;

CREATE POLICY "View own carts" ON public.carts FOR SELECT USING (profile_id = auth.uid() OR profile_id IS NULL);
CREATE POLICY "Anyone can create carts" ON public.carts FOR INSERT WITH CHECK (true);
CREATE POLICY "Update own carts" ON public.carts FOR UPDATE USING (profile_id = auth.uid() OR profile_id IS NULL);
CREATE POLICY "Delete own carts" ON public.carts FOR DELETE USING (profile_id = auth.uid() OR profile_id IS NULL);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View cart items for accessible carts" ON public.cart_items;
DROP POLICY IF EXISTS "Insert cart items for accessible carts" ON public.cart_items;
DROP POLICY IF EXISTS "Update cart items for accessible carts" ON public.cart_items;
DROP POLICY IF EXISTS "Delete cart items for accessible carts" ON public.cart_items;

CREATE POLICY "View cart items for accessible carts" ON public.cart_items FOR SELECT
USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)));

CREATE POLICY "Insert cart items for accessible carts" ON public.cart_items FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)));

CREATE POLICY "Update cart items for accessible carts" ON public.cart_items FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)));

CREATE POLICY "Delete cart items for accessible carts" ON public.cart_items FOR DELETE
USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)));


-- ============================================
-- FIX 3: Make Yourself Admin (OPTIONAL)
-- ============================================
-- Uncomment and update with your email:
-- INSERT INTO public.profiles (id, role)
-- SELECT id, 'platform_admin'::user_role
-- FROM auth.users WHERE email = 'jeevansaigudela@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'platform_admin'::user_role;


-- ============================================
-- VERIFY FIXES
-- ============================================
SELECT column_name, is_nullable FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'profile_id';

SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'carts', 'cart_items')
ORDER BY tablename, policyname;
