import type { Metadata } from "next";
import Link from "next/link";
import { fetchProductBySlug, fetchSeoSettings } from "@/lib/services/catalog";
import { colors, layout as layoutConfig } from "@/lib/uiConfig";
import { ProductClientWrapper } from "./client-wrapper";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductReviews } from "@/components/products/ProductReviews";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const productData = await fetchProductBySlug(slug);
  const seoSettings = await fetchSeoSettings();

  if (!productData) {
    return {
      title: "Product not found | DoozyStyle Studio",
    };
  }

  const { product } = productData;

  const title =
    product.seo_title ||
    `${product.name}${seoSettings?.default_title_suffix ?? " | DoozyStyle Studio"}`;
  const description =
    product.seo_description || seoSettings?.default_meta_description || undefined;

  return {
    title,
    description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchProductBySlug(slug);

  if (!data) {
    return (
      <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding}`}>
        <div className={`rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-12 text-center`}>
          <p className="text-sm text-slate-500">This product could not be found.</p>
          <Link href="/" className={`mt-4 inline-block text-sm font-semibold ${colors.primaryText}`}>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const { product, variants, images, customizationOptions, addons, reviews } = data;

  return (
    <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding}`}>
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <Link href="/collections/photo-to-art" className="hover:text-amber-600">Collections</Link>
        <span>/</span>
        <span className="font-medium text-slate-900">{product.name}</span>
      </nav>

      {/* Product Detail Grid */}
      <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        {/* Left - Images */}
        <ProductImageGallery images={images} productName={product.name} />

        {/* Right - Details */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
              Ready in 3-5 Days
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              {product.name}
            </h1>
            {product.short_description ? (
              <p className="text-base leading-relaxed text-slate-600">
                {product.short_description}
              </p>
            ) : null}
          </div>

          {/* Interactive Components */}
          <ProductClientWrapper
            productId={product.id}
            variants={variants}
            customizationOptions={customizationOptions}
            addons={addons}
          />

          {/* Product Description */}
          {product.long_description ? (
            <div className={`space-y-3 border-t ${colors.borderLight} pt-6`}>
              <h2 className="text-sm font-bold text-slate-900">Product Details</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {product.long_description}
              </p>
            </div>
          ) : null}

          {/* Trust Badges */}
          <div className={`grid grid-cols-3 gap-4 rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-5 text-center text-xs`}>
            <div className="space-y-1">
              <svg className="mx-auto h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
              <p className="font-semibold text-slate-700">Preview First</p>
            </div>
            <div className="space-y-1">
              <svg className="mx-auto h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              <p className="font-semibold text-slate-700">Free Shipping</p>
            </div>
            <div className="space-y-1">
              <svg className="mx-auto h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <p className="font-semibold text-slate-700">Secure Payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="mt-16">
          <ProductReviews reviews={reviews} productName={product.name} />
        </div>
      )}
    </div>
  );
}
