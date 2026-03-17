-- ============================================
-- ESSENTIAL FIXES ONLY - Run in Supabase SQL Editor
-- ============================================
-- This fixes guest checkout and order viewing
-- No errors, just the essentials

-- ============================================
-- FIX 1: Allow Guest Checkout
-- ============================================
ALTER TABLE public.orders 
ALTER COLUMN profile_id DROP NOT NULL;


-- ============================================
-- FIX 2: Orders - View & Create
-- ============================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders by order_number" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Allow viewing orders (guest, owner, or admin)
CREATE POLICY "Anyone can view orders" 
ON public.orders 
FOR SELECT
USING (
  profile_id IS NULL  -- Guest orders
  OR profile_id = auth.uid()  -- Your orders
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('platform_admin', 'seller_admin')
  )
);

-- Allow creating orders (anyone can checkout)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to update orders
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
-- FIX 3: Order Items - View & Create
-- ============================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View order items for accessible orders" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- View order items for orders you can access
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

-- Allow creating order items (for checkout)
CREATE POLICY "Anyone can create order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);


-- ============================================
-- FIX 4: Carts - All Operations
-- ============================================
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View own carts" ON public.carts;
DROP POLICY IF EXISTS "Anyone can create carts" ON public.carts;
DROP POLICY IF EXISTS "Update own carts" ON public.carts;
DROP POLICY IF EXISTS "Delete own carts" ON public.carts;

CREATE POLICY "View own carts" ON public.carts FOR SELECT 
USING (profile_id = auth.uid() OR profile_id IS NULL);

CREATE POLICY "Anyone can create carts" ON public.carts FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Update own carts" ON public.carts FOR UPDATE 
USING (profile_id = auth.uid() OR profile_id IS NULL);

CREATE POLICY "Delete own carts" ON public.carts FOR DELETE 
USING (profile_id = auth.uid() OR profile_id IS NULL);


-- ============================================
-- FIX 5: Cart Items - All Operations
-- ============================================
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View cart items for accessible carts" ON public.cart_items;
DROP POLICY IF EXISTS "Insert cart items for accessible carts" ON public.cart_items;
DROP POLICY IF EXISTS "Update cart items for accessible carts" ON public.cart_items;
DROP POLICY IF EXISTS "Delete cart items for accessible carts" ON public.cart_items;

CREATE POLICY "View cart items for accessible carts" ON public.cart_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)
  )
);

CREATE POLICY "Insert cart items for accessible carts" ON public.cart_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)
  )
);

CREATE POLICY "Update cart items for accessible carts" ON public.cart_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)
  )
);

CREATE POLICY "Delete cart items for accessible carts" ON public.cart_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.profile_id = auth.uid() OR carts.profile_id IS NULL)
  )
);


-- ============================================
-- OPTIONAL: Make Yourself Admin
-- ============================================
-- Uncomment this section and update with your email to get admin access:

-- INSERT INTO public.profiles (id, role)
-- SELECT id, 'platform_admin'::user_role
-- FROM auth.users 
-- WHERE email = 'jeevansaigudela@gmail.com'
-- ON CONFLICT (id) 
-- DO UPDATE SET role = 'platform_admin'::user_role;


-- ============================================
-- VERIFY EVERYTHING WORKED
-- ============================================

-- Check if profile_id is nullable
SELECT 
  column_name, 
  is_nullable,
  data_type
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'profile_id';
-- Expected: is_nullable = 'YES'

-- Check all policies were created
SELECT 
  tablename, 
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'carts', 'cart_items')
ORDER BY tablename, policyname;
-- Expected: See all the policies listed above

-- ============================================
-- DONE! ✅
-- ============================================
-- Now test:
-- 1. Add to cart → should work
-- 2. Checkout (guest or logged in) → should work
-- 3. View order page → should work
-- 4. "My Orders" → shows only orders placed while logged in
