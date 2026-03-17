"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createBrowserSupabaseClient } from "@/lib/supabase/browserClient";
import { colors } from "@/lib/uiConfig";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function LoginModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createBrowserSupabaseClient();

    try {
      if (mode === "signin") {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessageType("error");
          if (error.message.includes("Invalid login credentials")) {
            setMessage("Invalid email or password. Please try again.");
          } else {
            setMessage(error.message);
          }
        } else {
          setMessageType("success");
          setMessage("✓ Welcome back! Redirecting...");
          // Force a full page reload to update server-side session
          setTimeout(() => {
            window.location.href = window.location.href;
          }, 1000);
        }
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });

        if (error) {
          setMessageType("error");
          if (error.message.includes("already registered")) {
            setMessage("This email is already registered. Try signing in instead.");
          } else {
            setMessage(error.message);
          }
        } else {
          setMessageType("success");
          setMessage("✓ Account created successfully! Check your email to verify and complete registration.");
          // Clear form after success
          setTimeout(() => {
            setEmail("");
            setPassword("");
            setMode("signin");
            setMessage("");
          }, 5000);
        }
      }
    } catch (error) {
      setMessageType("error");
      setMessage("⚠ Connection failed. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !mounted) return null;

  console.log('LoginModal is rendering!', { isOpen, mode });

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div style={{ 
        width: '100%', 
        maxWidth: '28rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '32px 0'
      }}>
        <div 
          className={`w-full rounded-2xl ${colors.surface} p-6 shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
          style={{ 
            position: 'relative',
            backgroundColor: 'white',
            maxWidth: '100%'
          }}
        >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMessage("");
                  }}
                  required
                  autoComplete="email"
                  disabled={loading}
                  className={`w-full rounded-xl border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2 disabled:bg-slate-50 disabled:cursor-not-allowed`}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  {mode === "signup" && (
                    <span className="text-[10px] text-slate-500">Min. 6 characters</span>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setMessage("");
                  }}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  disabled={loading}
                  className={`w-full rounded-xl border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2 disabled:bg-slate-50 disabled:cursor-not-allowed`}
                  placeholder="Enter your password"
                />
              </div>

          {message && (
            <div 
              className={`rounded-xl p-4 text-xs font-medium ${
                messageType === "success" 
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
                  : messageType === "error"
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-blue-50 border border-blue-200 text-blue-800"
              }`}
            >
              <div className="flex items-start gap-2">
                {messageType === "success" && (
                  <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                )}
                {messageType === "error" && (
                  <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                )}
                <p className="flex-1 leading-relaxed">{message}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || messageType === "success"}
            className={`w-full rounded-xl ${colors.primary} px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all ${colors.primaryHover} hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === "signin" ? "Signing in..." : "Creating account..."}
              </span>
            ) : messageType === "success" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Success!
              </span>
            ) : (
              mode === "signin" ? "Sign In to Your Account" : "Create Your Account"
            )}
          </button>
            </form>

            {/* Footer */}
            <div className="mt-4 text-center text-xs text-slate-600">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-semibold text-amber-600 hover:text-amber-700"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="font-semibold text-amber-600 hover:text-amber-700"
                  >
                    Sign in
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
