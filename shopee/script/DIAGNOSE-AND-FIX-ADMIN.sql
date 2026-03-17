-- ============================================
-- DIAGNOSE & FIX ADMIN ACCESS
-- ============================================
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- STEP 1: Check if user exists in auth.users
-- ============================================
SELECT 
  'User exists in auth.users' as status,
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'jeevansaigudela@gmail.com';

-- If you see a row above, the user exists ✓
-- If no row, you need to sign up first


-- ============================================
-- STEP 2: Check if profile exists
-- ============================================
SELECT 
  'Profile exists' as status,
  p.id,
  p.role,
  p.full_name,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'jeevansaigudela@gmail.com';

-- If role is NULL or 'customer', we need to fix it


-- ============================================
-- STEP 3: CREATE/UPDATE PROFILE TO ADMIN
-- ============================================

-- First, ensure the profile exists
INSERT INTO public.profiles (id, role, full_name)
SELECT 
  u.id,
  'platform_admin'::user_role,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email)
FROM auth.users u
WHERE u.email = 'jeevansaigudela@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Then, update the role to platform_admin
UPDATE public.profiles
SET role = 'platform_admin'::user_role
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'jeevansaigudela@gmail.com'
);


-- ============================================
-- STEP 4: VERIFY THE FIX
-- ============================================
SELECT 
  '✓ VERIFICATION' as status,
  u.email,
  p.role,
  p.full_name,
  CASE 
    WHEN p.role = 'platform_admin' THEN '✓ SUCCESS - You are now admin!'
    WHEN p.role = 'seller_admin' THEN '⚠ You are seller_admin (limited access)'
    WHEN p.role = 'customer' THEN '✗ FAILED - Still customer role'
    WHEN p.role IS NULL THEN '✗ FAILED - No profile found'
    ELSE '? Unknown status'
  END as access_status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'jeevansaigudela@gmail.com';

-- Expected result: access_status = '✓ SUCCESS - You are now admin!'


-- ============================================
-- STEP 5: CHECK RLS POLICIES (OPTIONAL)
-- ============================================
-- Verify that admin policies exist
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename IN ('products', 'orders', 'categories')
AND policyname ILIKE '%admin%'
ORDER BY tablename, policyname;

-- You should see policies like "Admins can manage products", etc.


-- ============================================
-- TROUBLESHOOTING GUIDE
-- ============================================

-- If STEP 1 shows no results:
--   → You need to sign up at http://localhost:3000 first
--   → Use the Sign In button and create an account

-- If STEP 4 still shows 'customer' or NULL:
--   → Run this script again
--   → Make sure you're connected to the right Supabase project

-- If you see "✓ SUCCESS" but still get Access Denied:
--   → Sign out completely from http://localhost:3000
--   → Close all browser tabs
--   → Sign in again
--   → The session needs to refresh to pick up new role

-- If policies are missing:
--   → Run ADMIN-RLS-POLICIES.sql
--   → Run RUN-ALL-FIXES-SIMPLE.sql
