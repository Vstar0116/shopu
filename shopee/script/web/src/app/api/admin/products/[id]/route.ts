import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';

type Props = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Props) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const supabase = await createServerSupabaseClient();

    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...data,
        base_price: data.base_price ? parseFloat(data.base_price) : null,
        category_id: data.category_id || null,
        seller_id: parseInt(data.seller_id),
        min_processing_days: data.min_processing_days ? parseInt(data.min_processing_days) : null,
        max_processing_days: data.max_processing_days ? parseInt(data.max_processing_days) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error in PUT /api/admin/products/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        ),
        sellers (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
