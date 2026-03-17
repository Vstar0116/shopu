import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

// PUT /api/admin/bundles/[id] - Update bundle
export async function PUT(
  request: Request,
  { params }: Props
) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { items, ...bundleData } = body;

    const supabase = await createServerSupabaseClient();

    // Update bundle
    const { data: bundle, error: bundleError } = await supabase
      .from('product_bundles')
      .update(bundleData)
      .eq('id', id)
      .select()
      .single();

    if (bundleError) throw bundleError;

    // Update bundle items - delete existing and recreate
    await supabase
      .from('product_bundle_items')
      .delete()
      .eq('bundle_id', id);

    if (items && items.length > 0) {
      const bundleItems = items.map((item: any) => ({
        bundle_id: parseInt(id),
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('product_bundle_items')
        .insert(bundleItems);

      if (itemsError) throw itemsError;
    }

    return NextResponse.json(bundle);
  } catch (error: any) {
    console.error('Error updating bundle:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update bundle' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/bundles/[id] - Delete bundle
export async function DELETE(
  request: Request,
  { params }: Props
) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Delete bundle items first
    await supabase
      .from('product_bundle_items')
      .delete()
      .eq('bundle_id', id);

    // Delete bundle
    const { error } = await supabase
      .from('product_bundles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting bundle:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete bundle' },
      { status: 500 }
    );
  }
}
