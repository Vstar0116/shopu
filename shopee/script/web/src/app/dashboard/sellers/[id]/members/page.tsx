import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect, notFound } from 'next/navigation';
import SellerMembersClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export default async function SellerMembersPage({ params }: Props) {
  const { hasAccess, isPlatformAdmin } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch seller
  const { data: seller } = await supabase
    .from('sellers')
    .select('*')
    .eq('id', id)
    .single();

  if (!seller) {
    notFound();
  }

  // Fetch seller members
  const { data: members } = await supabase
    .from('seller_members')
    .select(`
      *,
      profiles (
        full_name,
        email:id
      )
    `)
    .eq('seller_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{seller.name} - Team Members</h1>
        <p className="mt-2 text-sm text-slate-600">Manage team members and their roles</p>
      </div>

      <SellerMembersClient 
        sellerId={parseInt(id)} 
        members={members || []}
        canManage={isPlatformAdmin}
      />
    </div>
  );
}
