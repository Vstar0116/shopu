import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import PaymentsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PaymentsPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch payment intents with order info
  const { data: payments } = await supabase
    .from('payment_intents')
    .select(`
      *,
      orders (
        order_number,
        profiles (
          full_name
        )
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payment Transactions</h1>
        <p className="mt-2 text-sm text-slate-600">
          View and manage payment transactions, process refunds
        </p>
      </div>

      <PaymentsClient payments={payments || []} />
    </div>
  );
}
