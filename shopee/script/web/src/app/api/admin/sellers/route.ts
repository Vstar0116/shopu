import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/sellers - List all sellers
export async function GET() {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sellers' },
      { status: 500 }
    );
  }
}

// POST /api/admin/sellers - Create new seller
export async function POST(request: Request) {
  try {
    const { hasAccess, isPlatformAdmin } = await checkAdminAccess();
    if (!hasAccess || !isPlatformAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Platform Admin only' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('sellers')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating seller:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create seller' },
      { status: 500 }
    );
  }
}
