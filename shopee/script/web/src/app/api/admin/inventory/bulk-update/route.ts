import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/admin/inventory/bulk-update - Bulk update stock levels
export async function POST(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Invalid updates' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const results = [];

    // Process each update
    for (const update of updates) {
      const { table, id, stock_quantity } = update;

      if (!table || !id || stock_quantity === undefined) {
        continue;
      }

      if (table === 'products') {
        const { data, error } = await supabase
          .from('products')
          .update({ stock_quantity })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating product stock:', error);
        } else {
          results.push({ table, id, success: true });
        }
      } else if (table === 'product_variants') {
        const { data, error } = await supabase
          .from('product_variants')
          .update({ stock_quantity })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating variant stock:', error);
        } else {
          results.push({ table, id, success: true });
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      updated: results.filter((r) => r.success).length,
      total: updates.length,
    });
  } catch (error: any) {
    console.error('Error bulk updating inventory:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update inventory' },
      { status: 500 }
    );
  }
}
