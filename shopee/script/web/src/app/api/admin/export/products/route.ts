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
      .from('products')
      .select('id, name, slug, sku, price, stock_quantity, is_active, created_at');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Convert to CSV
    const headers = ['ID', 'Name', 'SKU', 'Price', 'Stock', 'Active', 'Created'];
    const csv = [
      headers.join(','),
      ...data.map((p) =>
        [
          p.id,
          `"${p.name}"`,
          p.sku || '',
          p.price,
          p.stock_quantity || 'Unlimited',
          p.is_active ? 'Yes' : 'No',
          new Date(p.created_at).toLocaleDateString('en-IN'),
        ].join(',')
      ),
    ].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="products-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
