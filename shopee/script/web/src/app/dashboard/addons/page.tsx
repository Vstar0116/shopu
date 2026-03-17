import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import AddonsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AddonsPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch all add-ons
  const { data: addons } = await supabase
    .from('product_addons')
    .select('*')
    .order('name', { ascending: true });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Product Add-ons</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create add-ons like gift wrapping, express delivery, or custom frames
        </p>
      </div>

      <AddonsClient addons={addons || []} />
    </div>
  );
}
