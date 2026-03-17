import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import NotificationsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NotificationsPage() {
  const { hasAccess, profile } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch notifications for this admin
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="mt-2 text-sm text-slate-600">
          View and manage your admin notifications
        </p>
      </div>

      <NotificationsClient notifications={notifications || []} profileId={profile.id} />
    </div>
  );
}
