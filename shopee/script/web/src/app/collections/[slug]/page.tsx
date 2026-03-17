import type { Metadata } from "next";
import Link from "next/link";
import { fetchCategoryWithProducts, fetchSeoSettings } from "@/lib/services/catalog";
import { colors, layout as layoutConfig } from "@/lib/uiConfig";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoryWithProducts = await fetchCategoryWithProducts(slug);
  const seoSettings = await fetchSeoSettings();

  if (!categoryWithProducts) {
    return {
      title: "Category not found | DoozyStyle Studio",
    };
  }

  const { category } = categoryWithProducts;

  const title =
    category.seo_title ||
    `${category.name}${seoSettings?.default_title_suffix ?? " | DoozyStyle Studio"}`;
  const description =
    category.seo_description || seoSettings?.default_meta_description || undefined;

  return {
    title,
    description,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchCategoryWithProducts(slug);

  if (!data) {
    return (
      <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding}`}>
        <div className={`rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-8 text-center`}>
          <p className="text-sm text-slate-500">This collection could not be found.</p>
          <Link href="/" className={`mt-4 inline-block text-sm font-semibold ${colors.primaryText}`}>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const { category, products } = data;

  return (
    <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding}`}>
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="font-medium text-slate-900">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-10 space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
          {category.name}
        </h1>
        {category.description ? (
          <p className="max-w-3xl text-base text-slate-600">{category.description}</p>
        ) : null}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className={`rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-12 text-center`}>
          <p className="text-sm text-slate-500">No products are currently available in this collection.</p>
          <Link href="/" className={`mt-4 inline-block text-sm font-semibold ${colors.primaryText}`}>
            Explore Other Collections
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className={`group flex flex-col overflow-hidden rounded-2xl border ${colors.borderLight} ${colors.surface} shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="aspect-square w-full bg-slate-100 flex items-center justify-center">
                <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <div className="flex flex-1 flex-col justify-between space-y-3 p-5">
                <div className="space-y-2">
                  <h2 className={`text-base font-bold ${colors.textPrimary} transition-colors group-hover:text-amber-600`}>
                    {product.name}
                  </h2>
                  {product.short_description ? (
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {product.short_description}
                    </p>
                  ) : null}
                </div>
                {product.base_price != null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      From ₹{Number(product.base_price).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-500">onwards</span>
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
