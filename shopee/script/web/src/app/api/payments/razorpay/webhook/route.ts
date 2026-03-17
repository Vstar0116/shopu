import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const bodyText = await request.text();
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(bodyText)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(bodyText) as {
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          amount?: number;
          currency?: string;
          status?: string;
        };
      };
    };
  };

  const payment = payload.payload?.payment?.entity;

  if (!payment?.order_id || !payment.id) {
    return NextResponse.json({ received: true });
  }

  const supabase = await createServerSupabaseClient();

  const { data: intent } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("provider_order_id", payment.order_id)
    .maybeSingle();

  if (!intent) {
    return NextResponse.json({ received: true });
  }

  const succeeded = payment.status === "captured";

  await supabase.from("payment_transactions").insert({
    order_id: intent.order_id,
    provider: "razorpay",
    provider_payment_id: payment.id,
    status: succeeded ? "confirmed" : "failed",
    amount: (payment.amount ?? 0) / 100,
    currency: payment.currency ?? "INR",
    raw_payload: payload,
  });

  await supabase
    .from("payment_intents")
    .update({
      status: succeeded ? "succeeded" : "failed",
    })
    .eq("id", intent.id);

  if (succeeded) {
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "artwork_in_progress",
      })
      .eq("id", intent.order_id);
  }

  return NextResponse.json({ received: true });
}

