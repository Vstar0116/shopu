import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';

export async function POST(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const supabase = await createServerSupabaseClient();

    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        ...data,
        base_price: data.base_price ? parseFloat(data.base_price) : null,
        category_id: data.category_id || null,
        seller_id: parseInt(data.seller_id),
        min_processing_days: data.min_processing_days ? parseInt(data.min_processing_days) : null,
        max_processing_days: data.max_processing_days ? parseInt(data.max_processing_days) : null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error in POST /api/admin/products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const supabase = await createServerSupabaseClient();

    const { data: products, error } = await supabase
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
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
