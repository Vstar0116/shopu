'use client';

import { usePathname } from 'next/navigation';
import {
  brand,
  colors,
  layout as layoutConfig,
  nav,
  navLabels,
  topBar,
  footer,
} from '@/lib/uiConfig';
import { UserMenu } from './UserMenu';

export function CustomerLayout({ children, user }: { children: React.ReactNode; user: any }) {
  const pathname = usePathname();
  
  // Don't show customer layout on admin dashboard routes
  const isAdminRoute = pathname?.startsWith('/dashboard');
  
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Announcement Bar */}
      <div className={`${colors.dark} border-b ${colors.border} py-2.5 text-xs text-white`}>
        <div className={`mx-auto flex ${layoutConfig.maxWidth} items-center justify-between px-4 md:px-6`}>
          <span className="font-medium">{topBar.promo}</span>
          <span className="hidden text-slate-300 md:inline">{topBar.secondary}</span>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-30 ${colors.surface} border-b ${colors.border} backdrop-blur-lg bg-white/95`}>
        <div className={`mx-auto ${layoutConfig.maxWidth} flex items-center justify-between px-4 py-4 md:px-6`}>
          <a href="/" className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.primary} text-sm font-bold uppercase text-white shadow-sm`}>
              {brand.shortName.substring(0, 2)}
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-base font-bold tracking-tight text-slate-900">{brand.name}</span>
              <span className="text-[10px] text-slate-500">{brand.tagline}</span>
            </div>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="/" className={nav.link}>{navLabels.home}</a>
            <a href="/collections/photo-to-art" className={nav.link}>{navLabels.photoToArt}</a>
            <a href="/collections/acrylic" className={nav.link}>{navLabels.acrylic}</a>
            <a href="/collections/photo-gifts" className={nav.link}>{navLabels.photoGifts}</a>
          </nav>

          <div className="flex items-center gap-3">
            <UserMenu user={user} />
            <a
              href="/cart"
              className={`inline-flex items-center gap-2 rounded-lg ${colors.dark} px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all ${colors.darkHover}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {navLabels.cart}
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className={`border-t ${colors.border} ${colors.surface} mt-16`}>
        <div className={`mx-auto ${layoutConfig.maxWidth} px-4 py-12 md:px-6`}>
          <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1.5fr]">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.primary} text-sm font-bold uppercase text-white`}>
                  {brand.shortName.substring(0, 2)}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold tracking-tight text-slate-900">{brand.name}</span>
                  <span className="text-[10px] text-slate-500">{brand.tagline}</span>
                </div>
              </div>
              <p className="max-w-xs text-xs leading-relaxed text-slate-600">{brand.description}</p>
              <p className="text-xs text-slate-400">© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
            </div>

            {/* Collections Column */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">{footer.shopTitle}</p>
              <ul className="space-y-2 text-xs">
                <li><a href="/collections/photo-to-art" className={`${colors.textLight} hover:text-amber-600`}>{navLabels.photoToArt}</a></li>
                <li><a href="/collections/acrylic" className={`${colors.textLight} hover:text-amber-600`}>{navLabels.acrylic}</a></li>
                <li><a href="/collections/photo-gifts" className={`${colors.textLight} hover:text-amber-600`}>{navLabels.photoGifts}</a></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">{footer.supportTitle}</p>
              <ul className="space-y-2 text-xs">
                {footer.supportItems.map((item) => (
                  <li key={item} className={colors.textLight}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Stay Connected</p>
              <p className="text-xs text-slate-600">Get updates on new styles and exclusive offers.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className={`flex-1 rounded-lg border ${colors.border} px-3 py-2 text-xs outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
                />
                <button className={`rounded-lg ${colors.primary} px-4 py-2 text-xs font-semibold text-white transition ${colors.primaryHover}`}>
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className={`mt-8 border-t ${colors.borderLight} pt-6 text-center`}>
            <p className="text-[10px] text-slate-400">{footer.techTagline}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
