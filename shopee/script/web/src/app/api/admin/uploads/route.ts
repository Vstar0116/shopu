import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/uploads - List all customer uploads
export async function GET(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('customer_uploads')
      .select(`
        id,
        profile_id,
        order_id,
        storage_path,
        file_url,
        file_size,
        mime_type,
        uploaded_at,
        profiles (
          full_name
        ),
        orders (
          order_number
        )
      `)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}
