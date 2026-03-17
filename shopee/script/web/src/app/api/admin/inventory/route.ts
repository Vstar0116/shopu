import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/inventory - Get inventory data
export async function GET(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    // Fetch all products with variants
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        sku,
        stock_quantity,
        track_inventory,
        product_variants (
          id,
          sku,
          title,
          stock_quantity,
          is_active
        )
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}
