import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

export type UserRole = 'customer' | 'seller_admin' | 'platform_admin';

export async function checkAdminAccess(): Promise<{
  user: any;
  profile: any;
  hasAccess: boolean;
  isPlatformAdmin: boolean;
  isSellerAdmin: boolean;
}> {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  console.log('=== ADMIN ACCESS CHECK ===');
  console.log('User:', user?.email, 'ID:', user?.id);
  console.log('Auth Error:', authError);
  
  if (authError || !user) {
    console.log('No user found, denying access');
    return {
      user: null,
      profile: null,
      hasAccess: false,
      isPlatformAdmin: false,
      isSellerAdmin: false,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  console.log('Profile:', profile);
  console.log('Profile Error:', profileError);
  console.log('Profile Role:', profile?.role);

  const isPlatformAdmin = profile?.role === 'platform_admin';
  const isSellerAdmin = profile?.role === 'seller_admin';
  const hasAccess = isPlatformAdmin || isSellerAdmin;

  console.log('isPlatformAdmin:', isPlatformAdmin);
  console.log('isSellerAdmin:', isSellerAdmin);
  console.log('hasAccess:', hasAccess);
  console.log('=========================');

  return {
    user,
    profile,
    hasAccess,
    isPlatformAdmin,
    isSellerAdmin,
  };
}

export function requirePlatformAdmin(isPlatformAdmin: boolean) {
  if (!isPlatformAdmin) {
    throw new Error('Platform admin access required');
  }
}

export function requireAdminAccess(hasAccess: boolean) {
  if (!hasAccess) {
    throw new Error('Admin access required');
  }
}
