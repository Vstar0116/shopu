import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { getOrCreateCart } from "@/lib/services/cart";

export async function POST(request: Request) {
  const formData = await request.formData();

  const fullName = formData.get("full_name")?.toString() ?? "";
  const phone = formData.get("phone")?.toString() ?? "";
  const addressLine1 = formData.get("address_line1")?.toString() ?? "";
  const city = formData.get("city")?.toString() ?? "";
  const state = formData.get("state")?.toString() ?? "";
  const country = formData.get("country")?.toString() ?? "";
  const pincode = formData.get("pincode")?.toString() ?? "";

  const supabase = await createServerSupabaseClient();
  const cart = await getOrCreateCart();

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      unit_price_snapshot,
      product_id,
      variant_id,
      products!inner (
        id,
        seller_id,
        name
      )
    `
    )
    .eq("cart_id", cart.id);

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.redirect(new URL("/cart", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.unit_price_snapshot) * item.quantity,
    0
  );

  const shippingAddress = {
    full_name: fullName,
    phone,
    address_line1: addressLine1,
    city,
    state,
    country,
    pincode,
  };

  const sellerId = (cartItems[0].products as any)?.seller_id;

  if (!sellerId) {
    return NextResponse.json(
      { error: "Missing seller for cart items" },
      { status: 400 }
    );
  }

  const orderNumber = `DS-${Date.now()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      profile_id: user?.id ?? null,
      seller_id: sellerId,
      subtotal_amount: subtotal,
      total_amount: subtotal,
      currency: "INR",
      payment_method: "cod",
      payment_status: "pending",
      status: "processing",
      shipping_address_snapshot: shippingAddress,
    })
    .select("*")
    .maybeSingle();

  if (orderError || !order) {
    console.error("Error creating order", orderError);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  const orderItemsPayload = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name_snapshot: (item.products as any)?.name ?? "",
    variant_title_snapshot: null,
    quantity: item.quantity,
    unit_price: item.unit_price_snapshot,
    total_price: Number(item.unit_price_snapshot) * item.quantity,
  }));

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItemsPayload);

  if (orderItemsError) {
    console.error("Error creating order items", orderItemsError);
    return NextResponse.json(
      { error: "Failed to create order items" },
      { status: 500 }
    );
  }

  // Clear cart for this reference implementation
  await supabase.from("cart_items").delete().eq("cart_id", cart.id);

  return NextResponse.redirect(new URL(`/order/${order.order_number}`, request.url));
}

