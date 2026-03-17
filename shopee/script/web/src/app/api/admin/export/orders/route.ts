import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const supabase = await createServerSupabaseClient();
    
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        profiles (
          full_name
        )
      `);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Convert to CSV
    const headers = ['Order Number', 'Customer', 'Status', 'Total', 'Date'];
    const csv = [
      headers.join(','),
      ...data.map((o: any) =>
        [
          o.order_number,
          `"${o.profiles?.full_name || 'Guest'}"`,
          o.status,
          o.total_amount,
          new Date(o.created_at).toLocaleDateString('en-IN'),
        ].join(',')
      ),
    ].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
