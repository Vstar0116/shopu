import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import CustomersClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomersPage() {
  const supabase = await createServerSupabaseClient();

  // Get customers with their auth emails
  const { data: customers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });

  // Get order stats (count and total spent)
  const customerIds = customers?.map((c) => c.id) || [];
  const { data: orders } = await supabase
    .from('orders')
    .select('profile_id, total_amount')
    .in('profile_id', customerIds);

  const orderStats = orders?.reduce((acc: Record<string, { count: number; totalSpent: number }>, order) => {
    if (!acc[order.profile_id]) {
      acc[order.profile_id] = { count: 0, totalSpent: 0 };
    }
    acc[order.profile_id].count += 1;
    acc[order.profile_id].totalSpent += Number(order.total_amount);
    return acc;
  }, {}) || {};

  // Get emails from auth.users - need to fetch individually or use admin client
  // For now, we'll add email to the display by fetching from auth
  const enrichedCustomers = await Promise.all(
    (customers || []).map(async (customer) => {
      // Get user email from auth
      const { data: { user } } = await supabase.auth.admin.getUserById(customer.id);
      const stats = orderStats[customer.id] || { count: 0, totalSpent: 0 };
      
      return {
        ...customer,
        email: user?.email || null,
        orderCount: stats.count,
        totalSpent: stats.totalSpent,
      };
    })
  );

  return <CustomersClient customers={enrichedCustomers} />;
}
