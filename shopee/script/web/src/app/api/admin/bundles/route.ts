import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/bundles - List all bundles
export async function GET(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('product_bundles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching bundles:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bundles' },
      { status: 500 }
    );
  }
}

// POST /api/admin/bundles - Create bundle
export async function POST(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, ...bundleData } = body;

    const supabase = await createServerSupabaseClient();

    // Create bundle
    const { data: bundle, error: bundleError } = await supabase
      .from('product_bundles')
      .insert([bundleData])
      .select()
      .single();

    if (bundleError) throw bundleError;

    // Create bundle items
    if (items && items.length > 0) {
      const bundleItems = items.map((item: any) => ({
        bundle_id: bundle.id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('product_bundle_items')
        .insert(bundleItems);

      if (itemsError) throw itemsError;
    }

    return NextResponse.json(bundle, { status: 201 });
  } catch (error: any) {
    console.error('Error creating bundle:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create bundle' },
      { status: 500 }
    );
  }
}
