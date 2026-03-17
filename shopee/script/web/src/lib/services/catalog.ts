import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export async function fetchSeoSettings() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("seo_settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function fetchActiveCategories() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Error fetching categories", error);
    return [];
  }

  return data ?? [];
}

export async function fetchCategoryWithProducts(slug: string) {
  const supabase = await createServerSupabaseClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, description, seo_title, seo_description")
    .eq("slug", slug)
    .maybeSingle();

  if (!category) return null;

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, slug, short_description, base_price, currency, seo_title, seo_description"
    )
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return {
    category,
    products: products ?? [],
  };
}

export async function fetchProductBySlug(slug: string) {
  const supabase = await createServerSupabaseClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      short_description,
      long_description,
      base_price,
      currency,
      is_customizable,
      seo_title,
      seo_description,
      seo_og_image_url
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!product) return null;

  const [
    { data: variants },
    { data: images },
    { data: customizationOptions },
    { data: addons },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, sku, title, attributes, price, compare_at_price, stock_quantity")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("price", { ascending: true }),
    supabase
      .from("product_images")
      .select("id, image_url, alt_text, sort_order")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("customization_options")
      .select("id, key, label, type, required, config, sort_order")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_addon_links")
      .select(`
        id,
        is_required,
        sort_order,
        addon:product_addons!inner(
          id,
          name,
          description,
          price,
          addon_type,
          is_active
        )
      `)
      .eq("product_id", product.id)
      .eq("addon.is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_reviews")
      .select(`
        id,
        rating,
        title,
        body,
        created_at,
        profile:profiles!inner(
          full_name
        )
      `)
      .eq("product_id", product.id)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return {
    product,
    variants: variants ?? [],
    images: images ?? [],
    customizationOptions: customizationOptions ?? [],
    addons: addons ?? [],
    reviews: reviews ?? [],
  };
}

