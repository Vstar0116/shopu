import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import type { DashboardStats, OrderStatusCount } from '@/types/admin';

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const supabase = await createServerSupabaseClient();

  try {
    // Get all orders
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, placed_at, status');

    if (!orders) {
      return null;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayOrders = orders.filter(o => new Date(o.placed_at) >= todayStart);
    const weekOrders = orders.filter(o => new Date(o.placed_at) >= weekStart);
    const monthOrders = orders.filter(o => new Date(o.placed_at) >= monthStart);

    // Get customer count
    const { count: customerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // Get product count
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + Number(o.total_amount), 0),
      totalCustomers: customerCount || 0,
      totalProducts: productCount || 0,
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
      weekOrders: weekOrders.length,
      weekRevenue: weekOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
      monthOrders: monthOrders.length,
      monthRevenue: monthOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

export async function getOrderStatusCounts(): Promise<OrderStatusCount[]> {
  const supabase = await createServerSupabaseClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('status');

  if (!orders) return [];

  const statusCounts: Record<string, number> = {};
  orders.forEach((order) => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status as any,
    count,
  }));
}

export async function getRecentOrders(limit: number = 10) {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total_amount,
      status,
      placed_at,
      payment_status,
      profiles (
        full_name,
        email
      )
    `)
    .order('placed_at', { ascending: false })
    .limit(limit);

  return data || [];
}
