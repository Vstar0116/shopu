import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import ArtworkClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ArtworkPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch pending artwork approvals
  const { data: artworks } = await supabase
    .from('artwork_files')
    .select(`
      id,
      order_id,
      order_item_id,
      file_url,
      version,
      uploaded_at,
      orders!inner (
        order_number,
        profiles (
          full_name
        )
      ),
      artwork_approvals (
        id,
        status,
        designer_notes,
        customer_notes,
        approved_at,
        approved_by
      )
    `)
    .order('uploaded_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Artwork Workflow</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review and approve customer artwork submissions
        </p>
      </div>

      <ArtworkClient artworks={artworks || []} />
    </div>
  );
}
