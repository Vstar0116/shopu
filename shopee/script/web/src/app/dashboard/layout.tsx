import AdminLayout from '@/components/admin/AdminLayout';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { hasAccess, profile, isPlatformAdmin } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  return (
    <AdminLayout
      userName={profile?.full_name || 'Admin'}
      userRole={profile?.role === 'platform_admin' ? 'Platform Admin' : 'Seller Admin'}
      isPlatformAdmin={isPlatformAdmin}
    >
      {children}
    </AdminLayout>
  );
}
