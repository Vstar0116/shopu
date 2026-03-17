import type { Metadata } from "next";
import "./globals.css";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { UserProvider } from "@/components/providers/UserProvider";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { AuthDebug } from "@/components/debug/AuthDebug";
import { brand } from "@/lib/uiConfig";

export const metadata: Metadata = {
  title: brand.name,
  description: brand.tagline,
};

// Force dynamic rendering for auth
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <UserProvider initialSession={session}>
          <CustomerLayout user={user}>
            {children}
          </CustomerLayout>
          <AuthDebug />
        </UserProvider>
      </body>
    </html>
  );
}
