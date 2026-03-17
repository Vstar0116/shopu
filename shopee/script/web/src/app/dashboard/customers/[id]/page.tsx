import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import CustomerDetailClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch customer profile
  const { data: customer } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!customer) {
    redirect('/dashboard/customers');
  }

  // Fetch customer orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('profile_id', id)
    .order('created_at', { ascending: false });

  // Fetch customer addresses
  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('profile_id', id);

  // Fetch customer reviews
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select(`
      id,
      product_id,
      rating,
      title,
      body,
      is_published,
      created_at,
      products:product_id (
        name,
        slug
      )
    `)
    .eq('profile_id', id)
    .order('created_at', { ascending: false });

  // Fetch wishlist items
  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('id')
    .eq('profile_id', id)
    .maybeSingle();

  let wishlistItems: any[] = [];
  if (wishlist) {
    const { data } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        product_id,
        created_at,
        products:product_id (
          name,
          slug
        )
      `)
      .eq('wishlist_id', wishlist.id)
      .order('created_at', { ascending: false });
    
    wishlistItems = data || [];
  }

  return <CustomerDetailClient 
    customer={customer} 
    orders={orders || []} 
    addresses={addresses || []} 
    reviews={reviews || []}
    wishlistItems={wishlistItems}
  />;
}
