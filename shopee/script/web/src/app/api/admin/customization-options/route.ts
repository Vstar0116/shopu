import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/customization-options - List options for a product
export async function GET(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json({ error: 'product_id required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('customization_options')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching customization options:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch options' },
      { status: 500 }
    );
  }
}

// POST /api/admin/customization-options - Create option
export async function POST(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    // Get max sort_order for this product
    const { data: maxSort } = await supabase
      .from('customization_options')
      .select('sort_order')
      .eq('product_id', body.product_id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const sort_order = maxSort ? maxSort.sort_order + 1 : 0;

    const { data, error } = await supabase
      .from('customization_options')
      .insert([{ ...body, sort_order }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customization option:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create option' },
      { status: 500 }
    );
  }
}
