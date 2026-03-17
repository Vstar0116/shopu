import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import WishlistsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WishlistsPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch all wishlists with items
  const { data: wishlists } = await supabase
    .from('wishlists')
    .select(`
      *,
      profiles (
        full_name
      ),
      wishlist_items (
        id,
        products (
          name
        )
      )
    `)
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Customer Wishlists</h1>
        <p className="mt-2 text-sm text-slate-600">
          View customer wishlists and popular items
        </p>
      </div>

      <WishlistsClient wishlists={wishlists || []} />
    </div>
  );
}
