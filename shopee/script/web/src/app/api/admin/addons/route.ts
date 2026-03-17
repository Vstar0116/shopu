import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/addons - List all add-ons
export async function GET(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('product_addons')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching addons:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch addons' },
      { status: 500 }
    );
  }
}

// POST /api/admin/addons - Create add-on
export async function POST(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('product_addons')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating addon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create addon' },
      { status: 500 }
    );
  }
}
