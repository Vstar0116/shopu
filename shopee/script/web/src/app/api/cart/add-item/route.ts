import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { getOrCreateCart } from "@/lib/services/cart";

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, variantId, quantity, customizationData, selectedAddons } = body as {
    productId: number;
    variantId?: number;
    quantity?: number;
    customizationData?: Record<string, any>;
    selectedAddons?: { addon_id: number; quantity: number }[];
  };

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const cart = await getOrCreateCart();

  const { data: variant } = await supabase
    .from("product_variants")
    .select("id, price")
    .eq("id", variantId ?? 0)
    .maybeSingle();

  const unitPrice = variant?.price;

  if (unitPrice == null) {
    const { data: product } = await supabase
      .from("products")
      .select("base_price")
      .eq("id", productId)
      .maybeSingle();

    if (!product?.base_price) {
      return NextResponse.json(
        { error: "Unable to determine price for this item" },
        { status: 400 }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    (variant as any) = { price: product.base_price };
  }

  const { data: item, error } = await supabase
    .from("cart_items")
    .insert({
      cart_id: cart.id,
      product_id: productId,
      variant_id: variantId ?? null,
      quantity: quantity && quantity > 0 ? quantity : 1,
      unit_price_snapshot: variant?.price,
      customization_data: customizationData || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error adding to cart", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }

  // Add cart item addons if any
  if (selectedAddons && selectedAddons.length > 0 && item) {
    const addonInserts = selectedAddons.map(addon => ({
      cart_item_id: item.id,
      addon_id: addon.addon_id,
      quantity: addon.quantity,
    }));

    const { error: addonError } = await supabase
      .from("cart_item_addons")
      .insert(addonInserts);

    if (addonError) {
      console.error("Error adding cart item addons", addonError);
      // Continue anyway - item was added to cart
    }
  }

  return NextResponse.json(item);
}
