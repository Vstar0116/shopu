import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  try {
    const { hasAccess } = await checkAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Create refund transaction record
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert([{
        payment_intent_id: parseInt(id),
        transaction_type: 'refund',
        amount: 0, // Should fetch from payment_intent
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;

    // TODO: Integrate with Razorpay refund API

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
