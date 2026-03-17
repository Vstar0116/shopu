-- ============================================
-- Make User Platform Admin (CORRECT VERSION)
-- ============================================

-- Your database uses these role values:
-- 'customer', 'seller_admin', 'platform_admin'

-- Make yourself platform admin
UPDATE public.profiles 
SET role = 'platform_admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'jeevansaigudela@gmail.com'
);

-- If profile doesn't exist yet, create it
INSERT INTO public.profiles (id, role)
SELECT id, 'platform_admin'::user_role
FROM auth.users 
WHERE email = 'jeevansaigudela@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET role = 'platform_admin'::user_role;

-- Verify it worked
SELECT id, email, role 
FROM public.profiles 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'jeevansaigudela@gmail.com'
);

-- Expected result: role should be 'platform_admin'
