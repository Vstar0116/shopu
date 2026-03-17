import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

// GET /api/admin/discounts/[id] - Get single discount
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
      .from('discounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching discount:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch discount' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/discounts/[id] - Update discount
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
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('discounts')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating discount:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update discount' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/discounts/[id] - Delete discount
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
    const { error } = await supabase
      .from('discounts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting discount:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete discount' },
      { status: 500 }
    );
  }
}
