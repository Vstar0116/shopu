"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browserClient";

export function AuthDebug() {
  const [authState, setAuthState] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthState(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthState(session?.user || null);
      console.log('Auth state changed:', _event, session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hide in production
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 z-[99999] max-w-sm rounded-lg bg-slate-900 p-3 text-xs text-white shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold">🔐 Auth Debug</span>
      </div>
      <div className="space-y-1 font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">User:</span>
          <span className={authState ? "text-emerald-400" : "text-red-400"}>
            {authState ? "✓ Logged In" : "✗ Not Logged In"}
          </span>
        </div>
        {authState && (
          <>
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="text-amber-400">{authState.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ID:</span>
              <span className="text-blue-400 truncate max-w-[120px]">{authState.id}</span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span className="text-slate-400">Session:</span>
          <span className={session ? "text-emerald-400" : "text-red-400"}>
            {session ? "✓ Active" : "✗ None"}
          </span>
        </div>
      </div>
    </div>
  );
}
