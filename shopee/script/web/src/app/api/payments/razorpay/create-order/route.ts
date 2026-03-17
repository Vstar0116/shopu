import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export async function POST(request: Request) {
  const body = await request.json();
  const { orderId, amount } = body as {
    orderId: number;
    amount: number;
  };

  if (!orderId || !amount) {
    return NextResponse.json({ error: "Missing orderId or amount" }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay keys are not configured" },
      { status: 500 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.profile_id !== user?.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const instance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `order_rcptid_${order.id}`,
  };

  const razorpayOrder = await instance.orders.create(options);

  const { error: intentError } = await supabase.from("payment_intents").insert({
    order_id: order.id,
    provider: "razorpay",
    provider_order_id: razorpayOrder.id,
    amount,
    currency: "INR",
    status: "created",
  });

  if (intentError) {
    console.error("Error creating payment_intent", intentError);
  }

  return NextResponse.json({
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency: "INR",
    key: keyId,
  });
}

