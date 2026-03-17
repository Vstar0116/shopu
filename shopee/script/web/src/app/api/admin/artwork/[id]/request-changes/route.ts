import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

// POST /api/admin/artwork/[id]/request-changes - Request changes
export async function POST(
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

    // Create approval record with changes_requested status
    const { data, error } = await supabase
      .from('artwork_approvals')
      .insert([{
        artwork_file_id: parseInt(id),
        status: 'changes_requested',
        designer_notes: body.designer_notes,
        approved_by: body.approved_by,
        approved_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error requesting changes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to request changes' },
      { status: 500 }
    );
  }
}
