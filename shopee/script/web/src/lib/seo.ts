import type { Metadata } from "next";
import { fetchSeoSettings } from "@/lib/services/catalog";

export async function buildPageMetadata(
  overrides: Partial<Metadata> & { title?: string }
): Promise<Metadata> {
  const seoSettings = await fetchSeoSettings();

  const baseTitle =
    overrides.title ??
    `DoozyStyle Studio${seoSettings?.default_title_suffix ?? ""}`;

  const description =
    (overrides.description as string | undefined) ??
    seoSettings?.default_meta_description ??
    "Custom photo-to-art, acrylic prints, and personalized gifts with fast delivery.";

  return {
    ...overrides,
    title: baseTitle,
    description,
  };
}

