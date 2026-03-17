import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import UploadsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomerUploadsPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch all customer uploads with profile and order info
  const { data: uploads } = await supabase
    .from('customer_uploads')
    .select(`
      id,
      profile_id,
      order_id,
      storage_path,
      file_url,
      file_size,
      mime_type,
      uploaded_at,
      profiles (
        full_name
      ),
      orders (
        order_number
      )
    `)
    .order('uploaded_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Customer Uploads</h1>
        <p className="mt-2 text-sm text-slate-600">
          View and manage files uploaded by customers
        </p>
      </div>

      <UploadsClient uploads={uploads || []} />
    </div>
  );
}
