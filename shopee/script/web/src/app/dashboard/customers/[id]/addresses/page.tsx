import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import AddressesClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export default async function CustomerAddressesPage({ params }: Props) {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch customer profile
  const { data: customer } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!customer) {
    redirect('/dashboard/customers');
  }

  // Fetch addresses
  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('profile_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {customer.full_name || 'Customer'} - Addresses
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage saved addresses for this customer
        </p>
      </div>

      <AddressesClient addresses={addresses || []} customerId={id} />
    </div>
  );
}
