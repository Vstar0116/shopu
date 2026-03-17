"use client";

import { useState, useEffect } from "react";
import { LoginModal } from "@/components/auth/LoginModal";
import { createBrowserSupabaseClient } from "@/lib/supabase/browserClient";
import { colors, navLabels } from "@/lib/uiConfig";

type Props = {
  user: any;
};

export function UserMenu({ user: initialUser }: Props) {
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    
    // Get current user on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      
      // Close login modal if user just signed in
      if (session?.user) {
        setShowLogin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowLogin(true)}
          className={`hidden rounded-lg border ${colors.border} px-4 py-2 text-xs font-medium ${colors.textSecondary} transition-all hover:border-amber-300 hover:bg-amber-50 md:inline-flex`}
        >
          Sign In
        </button>
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-sm font-bold text-white shadow-md ring-2 ring-amber-200 transition-all hover:shadow-lg"
        title={user.email || "User menu"}
      >
        {user.email?.[0]?.toUpperCase() || "U"}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className={`absolute right-0 top-12 z-50 w-56 rounded-xl border ${colors.borderLight} ${colors.surface} overflow-hidden shadow-xl`}>
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-900 truncate">{user.email}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Signed in</p>
            </div>
            <div className="p-2">
              <a
                href="/account/orders"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                {navLabels.myOrders}
              </a>
              <a
                href="/dashboard/orders"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                </svg>
                Dashboard
              </a>
            </div>
            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
