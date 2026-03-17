-- ============================================
-- Fix: Allow Guest Checkout (No Login Required)
-- ============================================
-- This makes profile_id optional in orders table
-- so users can checkout without being logged in

-- Make profile_id nullable to support guest checkout
ALTER TABLE public.orders 
ALTER COLUMN profile_id DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'profile_id';

-- Expected result: is_nullable = 'YES'
