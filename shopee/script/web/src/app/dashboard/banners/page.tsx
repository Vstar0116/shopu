import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import BannersClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BannersPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Banners</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage homepage banners and promotional slides
        </p>
      </div>

      <BannersClient banners={banners || []} />
    </div>
  );
}
