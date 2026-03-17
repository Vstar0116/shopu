-- ============================================
-- Make User Admin
-- ============================================
-- Run this in Supabase SQL Editor to grant admin access

-- Check if profile exists for your user
SELECT id, email, role, full_name 
FROM auth.users 
WHERE email = 'jeevansaigudela@gmail.com';

-- If profile doesn't exist in profiles table, create it
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email), 
  'admin'
FROM auth.users 
WHERE email = 'jeevansaigudela@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';

-- Update existing profile to admin
UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'jeevansaigudela@gmail.com';

-- Verify the change
SELECT id, email, role, full_name, created_at
FROM public.profiles 
WHERE email = 'jeevansaigudela@gmail.com';

-- ============================================
-- Expected Result:
-- You should see your user with role = 'admin'
-- ============================================
