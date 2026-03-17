import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Convert to CSV
    const headers = ['ID', 'Name', 'Role', 'Joined'];
    const csv = [
      headers.join(','),
      ...data.map((p) =>
        [
          p.id,
          `"${p.full_name || 'Unknown'}"`,
          p.role,
          new Date(p.created_at).toLocaleDateString('en-IN'),
        ].join(',')
      ),
    ].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
