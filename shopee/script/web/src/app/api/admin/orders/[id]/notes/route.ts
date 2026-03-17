import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  try {
    const { hasAccess, profile } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    // Create notification for order note
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        profile_id: profile.id,
        type: 'order',
        title: `Note added to order #${id}`,
        message: body.note,
        link: `/dashboard/orders/${id}`,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
