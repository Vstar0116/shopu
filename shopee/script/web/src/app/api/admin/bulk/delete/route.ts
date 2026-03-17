import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { table, ids } = body;

    if (!table || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Perform bulk delete
    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      deleted: ids.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
