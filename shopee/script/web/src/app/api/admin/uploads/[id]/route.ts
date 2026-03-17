import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

// DELETE /api/admin/uploads/[id] - Delete upload
export async function DELETE(
  request: Request,
  { params }: Props
) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Get upload details first
    const { data: upload } = await supabase
      .from('customer_uploads')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (upload?.storage_path) {
      // Delete from storage
      await supabase.storage
        .from('uploads')
        .remove([upload.storage_path]);
    }

    // Delete database record
    const { error } = await supabase
      .from('customer_uploads')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting upload:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete upload' },
      { status: 500 }
    );
  }
}
