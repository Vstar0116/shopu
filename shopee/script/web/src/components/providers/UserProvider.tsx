"use client";

type Props = {
  // Kept for future use; currently unused.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialSession: any;
  children: React.ReactNode;
};

export function UserProvider({ initialSession, children }: Props) {
  void initialSession;
  // For now, we render children directly without a client-side auth context.
  // Server components and API routes already use the server Supabase client securely.
  return <>{children}</>;
}

