import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import RedirectsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RedirectsPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  const { data: redirects } = await supabase
    .from('redirects')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">URL Redirects</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage 301/302 redirects for changed URLs
        </p>
      </div>

      <RedirectsClient redirects={redirects || []} />
    </div>
  );
}
