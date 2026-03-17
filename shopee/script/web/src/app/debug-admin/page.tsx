import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DebugAdminPage() {
  const supabase = await createServerSupabaseClient();
  
  // Get user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || 'no-user')
    .maybeSingle();

  // Check access logic
  const isPlatformAdmin = profile?.role === 'platform_admin';
  const isSellerAdmin = profile?.role === 'seller_admin';
  const hasAccess = isPlatformAdmin || isSellerAdmin;

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Access Debug</h1>

      {/* Auth Status */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-bold">Authentication</h2>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex gap-4">
            <span className="font-semibold text-slate-600">Logged In:</span>
            <span className={user ? 'text-green-600' : 'text-red-600'}>
              {user ? '✅ YES' : '❌ NO'}
            </span>
          </div>
          {user && (
            <>
              <div className="flex gap-4">
                <span className="font-semibold text-slate-600">User ID:</span>
                <span className="text-slate-900">{user.id}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-slate-600">Email:</span>
                <span className="text-slate-900">{user.email}</span>
              </div>
            </>
          )}
          {authError && (
            <div className="rounded bg-red-50 p-3 text-red-700">
              Error: {authError.message}
            </div>
          )}
        </div>
      </div>

      {/* Profile */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-bold">Profile Data</h2>
        {profile ? (
          <div className="space-y-2 font-mono text-sm">
            <div className="flex gap-4">
              <span className="font-semibold text-slate-600">Role:</span>
              <span className="text-lg font-bold text-amber-600">{profile.role}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-semibold text-slate-600">Full Name:</span>
              <span className="text-slate-900">{profile.full_name || 'Not set'}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-semibold text-slate-600">Email:</span>
              <span className="text-slate-900">{profile.email || 'Not set'}</span>
            </div>
          </div>
        ) : (
          <div className="rounded bg-red-50 p-3 text-red-700">
            {profileError ? `Error: ${profileError.message}` : 'No profile found'}
          </div>
        )}
      </div>

      {/* Access Check Results */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-bold">Access Check Logic</h2>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex gap-4">
            <span className="font-semibold text-slate-600">isPlatformAdmin:</span>
            <span className={isPlatformAdmin ? 'text-green-600' : 'text-red-600'}>
              {isPlatformAdmin ? '✅ TRUE' : '❌ FALSE'}
            </span>
          </div>
          <div className="flex gap-4">
            <span className="font-semibold text-slate-600">isSellerAdmin:</span>
            <span className={isSellerAdmin ? 'text-green-600' : 'text-red-600'}>
              {isSellerAdmin ? '✅ TRUE' : '❌ FALSE'}
            </span>
          </div>
          <div className="flex gap-4">
            <span className="font-semibold text-slate-600">hasAccess:</span>
            <span className={hasAccess ? 'text-green-600 text-xl' : 'text-red-600 text-xl'}>
              {hasAccess ? '✅ TRUE (SHOULD HAVE ACCESS)' : '❌ FALSE (ACCESS DENIED)'}
            </span>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div className={`rounded-lg border p-6 ${hasAccess ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <h2 className="mb-3 text-xl font-bold">Diagnosis</h2>
        {!user && (
          <div className="text-red-900">
            <p className="font-semibold">❌ You are NOT logged in</p>
            <p className="mt-2">Go to homepage and sign in first.</p>
          </div>
        )}
        
        {user && !profile && (
          <div className="text-red-900">
            <p className="font-semibold">❌ No profile found for your user</p>
            <p className="mt-2">Run DIAGNOSE-AND-FIX-ADMIN.sql to create profile.</p>
          </div>
        )}

        {user && profile && profile.role === 'customer' && (
          <div className="text-orange-900">
            <p className="font-semibold">⚠️ Your role is CUSTOMER (should be platform_admin)</p>
            <p className="mt-2">Run the admin grant SQL and refresh your session.</p>
          </div>
        )}

        {user && profile && (profile.role === 'platform_admin' || profile.role === 'seller_admin') && hasAccess && (
          <div className="text-green-900">
            <p className="font-semibold">✅ Everything looks correct!</p>
            <p className="mt-2">You should have access to /dashboard</p>
            <p className="mt-2">If still seeing Access Denied, try:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Sign out completely and sign in again</li>
              <li>Open in incognito/private window</li>
              <li>Clear browser cookies for localhost:3000</li>
            </ul>
          </div>
        )}

        {user && profile && (profile.role === 'platform_admin' || profile.role === 'seller_admin') && !hasAccess && (
          <div className="text-red-900">
            <p className="font-semibold">🐛 BUG: You have admin role but hasAccess is FALSE</p>
            <p className="mt-2">This is a logic error. Check the permissions.ts code.</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-2">
        <a
          href="/dashboard"
          className="block rounded-lg bg-amber-600 px-4 py-3 text-center font-semibold text-white hover:bg-amber-700"
        >
          Try Accessing Dashboard
        </a>
        <a
          href="/"
          className="block rounded-lg bg-slate-600 px-4 py-3 text-center font-semibold text-white hover:bg-slate-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
