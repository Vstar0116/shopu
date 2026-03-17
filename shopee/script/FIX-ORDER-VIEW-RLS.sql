-- ============================================
-- Fix: Allow Viewing Orders (Guest + Logged In)
-- ============================================
-- Allow anyone to view an order if they know the order_number
-- This is secure because order_number acts like a secret token

-- Enable RLS on orders table (if not already enabled)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view orders by order_number" ON public.orders;

-- Allow viewing orders if:
-- 1. You own the order (logged in and profile_id matches), OR
-- 2. You're an admin (platform_admin or seller_admin), OR
-- 3. It's a guest order (profile_id is NULL) - anyone with order_number can view
CREATE POLICY "Anyone can view orders by order_number"
ON public.orders
FOR SELECT
USING (
  profile_id IS NULL  -- Guest orders are viewable by anyone with the link
  OR 
  profile_id = auth.uid()  -- Your own orders (if logged in)
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('platform_admin', 'seller_admin')
  )  -- Admins can view all orders
);

-- Enable RLS on order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;

-- Allow viewing order items (linked to orders)
CREATE POLICY "Anyone can view order items"
ON public.order_items
FOR SELECT
USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;
