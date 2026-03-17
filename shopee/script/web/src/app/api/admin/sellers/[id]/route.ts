import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

// GET /api/admin/sellers/[id] - Get single seller
export async function GET(
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
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching seller:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch seller' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/sellers/[id] - Update seller
export async function PUT(
  request: Request,
  { params }: Props
) {
  try {
    const { hasAccess, isPlatformAdmin } = await checkAdminAccess();
    if (!hasAccess || !isPlatformAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Platform Admin only' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('sellers')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating seller:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update seller' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sellers/[id] - Delete seller
export async function DELETE(
  request: Request,
  { params }: Props
) {
  try {
    const { hasAccess, isPlatformAdmin } = await checkAdminAccess();
    if (!hasAccess || !isPlatformAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Platform Admin only' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('sellers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting seller:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete seller' },
      { status: 500 }
    );
  }
}
