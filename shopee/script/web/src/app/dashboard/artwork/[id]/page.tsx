import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect, notFound } from 'next/navigation';
import ArtworkDetailClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ArtworkDetailPage({ params }: Props) {
  const { hasAccess, profile } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch artwork with full details
  const { data: artwork } = await supabase
    .from('artwork_files')
    .select(`
      *,
      orders (
        order_number,
        profiles (
          full_name
        )
      ),
      artwork_approvals (
        *
      )
    `)
    .eq('id', id)
    .single();

  if (!artwork) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ArtworkDetailClient artwork={artwork} adminProfile={profile} />
    </div>
  );
}
