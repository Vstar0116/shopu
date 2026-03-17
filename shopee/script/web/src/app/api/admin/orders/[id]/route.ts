import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PUT /api/admin/orders/[id] - Update order status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    // Update order status and payment status
    const updates: any = {};
    if (body.status) updates.status = body.status;
    if (body.payment_status) updates.payment_status = body.payment_status;

    // Set timestamps based on status
    if (body.status === 'delivered' && !updates.delivered_at) {
      updates.delivered_at = new Date().toISOString();
    }
    if (body.status === 'cancelled' && !updates.cancelled_at) {
      updates.cancelled_at = new Date().toISOString();
    }
    if (body.payment_status === 'paid' && !updates.paid_at) {
      updates.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
