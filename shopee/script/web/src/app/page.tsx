import { brand, colors, copy, layout as layoutConfig } from "@/lib/uiConfig";
import {
  SparklesIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="space-y-0">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-slate-50">
        <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.sectionPadding}`}>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-800">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                {copy.hero.promoBadge}
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  {copy.hero.headingLine1}
                  <span className={`block bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent`}>
                    {copy.hero.headingHighlight}
                  </span>
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-slate-600 lg:text-lg">
                  {copy.hero.subtext}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="/collections/photo-to-art"
                  className={`group inline-flex items-center gap-2 rounded-xl ${colors.primary} px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition-all ${colors.primaryHover} hover:shadow-xl hover:shadow-amber-500/40`}
                >
                  {copy.primaryCta}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <a
                  href="/collections/photo-gifts"
                  className={`inline-flex items-center gap-2 rounded-xl border-2 ${colors.border} ${colors.surface} px-8 py-3.5 text-sm font-semibold ${colors.textPrimary} transition-all hover:border-amber-300 hover:bg-amber-50`}
                >
                  {copy.hero.secondaryCta}
                </a>
              </div>

              <div className="flex flex-wrap gap-6 pt-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {copy.freeShipping}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {copy.artworkPreview}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {copy.securePayments}
                </div>
              </div>
            </div>

            {/* Right Column - Visual Cards */}
            <div className="relative">
              <div className="absolute -right-2 -top-2 z-10 hidden rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg lg:block">
                {copy.hero.statBadge}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {copy.hero.heroCards.map((card, idx) => (
                  <div
                    key={card.title}
                    className={`group space-y-3 rounded-2xl border ${colors.borderLight} ${colors.surface} p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50">
                      <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">{card.label}</p>
                      <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                      <p className="text-xs text-slate-500">{card.priceNote}</p>
                    </div>
                  </div>
                ))}
                <div className={`col-span-2 rounded-2xl border border-dashed ${colors.border} ${colors.surfaceAlt} p-5 text-xs ${colors.textLight}`}>
                  {copy.hero.heroNote}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className={`${colors.surface} border-y ${colors.borderLight}`}>
        <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.sectionPaddingSmall}`}>
          <div className="mb-12 space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">{copy.whySection.kicker}</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{copy.whySection.title}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {copy.whySection.cards.map((card, index) => {
              const iconMap = [SparklesIcon, PaintBrushIcon, ShieldCheckIcon, BanknotesIcon];
              const Icon = iconMap[index] ?? SparklesIcon;
              const colorClasses = [
                "bg-emerald-100 text-emerald-700",
                "bg-blue-100 text-blue-700",
                "bg-purple-100 text-purple-700",
                "bg-rose-100 text-rose-700",
              ];
              
              return (
                <div key={card.title} className={`group space-y-4 rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-6 transition-all hover:border-amber-200 hover:shadow-md`}>
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[index]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                    <p className="text-xs leading-relaxed text-slate-600">{card.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className={colors.surfaceAlt}>
        <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.sectionPaddingSmall}`}>
          <div className="mb-10 flex items-end justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Our Craft</p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{copy.productStrip.title}</h2>
            </div>
            <a href="/collections/photo-to-art" className={`text-sm font-semibold ${colors.primaryText} transition-colors hover:text-amber-700`}>
              {copy.productStrip.viewAllLabel}
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {copy.productStrip.cards.map((card) => (
              <a
                key={card.title}
                href="/collections/photo-to-art"
                className={`group overflow-hidden rounded-2xl border ${colors.borderLight} ${colors.surface} shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center">
                  <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                      {card.label}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold ${colors.textPrimary} transition-colors group-hover:text-amber-600`}>{card.title}</h3>
                  <p className="text-sm font-semibold text-slate-700">{card.priceRange}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={colors.surface}>
        <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.sectionPaddingSmall}`}>
          <div className="mb-10 text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">{copy.socialProof.kicker}</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{copy.socialProof.title}</h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-600">{copy.socialProof.subtitle}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {copy.socialProof.reviews.map((review) => (
              <div
                key={review.title}
                className={`space-y-4 rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-6`}
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm font-semibold leading-snug text-slate-900">{review.title}</p>
                <p className="text-xs leading-relaxed text-slate-600">{review.body}</p>
                <p className="text-[11px] font-medium text-slate-500">{review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className={`${colors.dark} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-90"></div>
        <div className={`relative mx-auto ${layoutConfig.maxWidth} ${layoutConfig.sectionPaddingSmall}`}>
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
            <div className="max-w-xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">{copy.cta.kicker}</p>
              <h2 className="text-2xl font-bold text-white lg:text-3xl">{copy.cta.body}</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                href={copy.cta.whatsappHref}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-600 hover:shadow-xl"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                {copy.cta.primaryLabel}
              </a>
              <a
                href="/collections/photo-to-art"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-600 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-all hover:border-slate-400 hover:bg-slate-800"
              >
                {copy.cta.secondaryLabel}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
