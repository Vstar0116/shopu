import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import SeoClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SeoSettingsPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  const { data: settings } = await supabase
    .from('seo_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">SEO Settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Configure global SEO settings for your store
        </p>
      </div>

      <SeoClient settings={settings} />
    </div>
  );
}
