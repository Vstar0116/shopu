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
    const { table, ids, updates } = body;

    if (!table || !Array.isArray(ids) || !updates) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Perform bulk update
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .in('id', ids)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      updated: data.length,
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
