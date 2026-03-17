import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

const CART_COOKIE_NAME = "cart_id";

export async function getOrCreateCartId() {
  const cookieStore = await cookies();
  let cartId = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!cartId) {
    cartId = randomUUID();
    cookieStore.set(CART_COOKIE_NAME, cartId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return cartId;
}

export async function getOrCreateCart() {
  const supabase = await createServerSupabaseClient();
  const cartId = await getOrCreateCartId();

  const { data: existing } = await supabase
    .from("carts")
    .select("*")
    .eq("id", cartId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("carts")
    .insert({ id: cartId })
    .select("*")
    .maybeSingle();

  if (error || !data) {
    throw new Error("Unable to create cart");
  }

  return data;
}

