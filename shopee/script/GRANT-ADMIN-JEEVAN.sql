-- ============================================
-- Grant Platform Admin Access
-- ============================================
-- Run this in Supabase SQL Editor to grant admin access to jeevansaigudela@gmail.com

-- Make jeevansaigudela@gmail.com a platform admin
INSERT INTO public.profiles (id, role)
SELECT id, 'platform_admin'::user_role
FROM auth.users 
WHERE email = 'jeevansaigudela@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET role = 'platform_admin'::user_role;

-- Verify it worked
SELECT 
  u.id,
  u.email,
  p.role,
  p.full_name,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'jeevansaigudela@gmail.com';

-- Expected result: role should be 'platform_admin'
