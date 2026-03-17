# 🔧 Fix Admin Access - Step by Step

You're seeing "Access Denied" when trying to access `/dashboard`. Let's fix this!

## Quick Fix (Most Common Issue)

### Problem: Session Not Refreshed
After running the admin grant SQL, you need to refresh your session.

**Solution:**
1. Go to http://localhost:3000
2. Click your profile/avatar (top-right)
3. Click "Sign Out"
4. Sign in again
5. Go to http://localhost:3000/dashboard
6. Should work now! ✅

---

## If That Didn't Work - Complete Diagnostic

### Step 1: Run the Diagnostic SQL

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Click **New query**
4. Open the file: `DIAGNOSE-AND-FIX-ADMIN.sql`
5. Copy ALL the SQL and paste it
6. Click **Run** (or press Ctrl+Enter)

### Step 2: Read the Results

Look at the **STEP 4: VERIFICATION** section results:

#### ✅ If you see: `✓ SUCCESS - You are now admin!`
**Your role is correct!** The issue is your browser session.

**Fix:**
1. Open http://localhost:3000 in an **incognito/private window**
2. Sign in
3. Go to http://localhost:3000/dashboard
4. Should work!

If it works in incognito:
- Clear your browser cookies for localhost:3000
- Or just keep using the app (session will refresh eventually)

#### ❌ If you see: `✗ FAILED - Still customer role`
**The SQL didn't run properly.**

**Fix:**
1. In Supabase SQL Editor, run this single command:
```sql
UPDATE public.profiles
SET role = 'platform_admin'::user_role
WHERE id = (SELECT id FROM auth.users WHERE email = 'jeevansaigudela@gmail.com');
```

2. Check the result count - should say "1 row updated"

3. Verify with:
```sql
SELECT email, role FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'jeevansaigudela@gmail.com';
```

4. Should show: `role = platform_admin`

#### ⚠️ If you see: `✗ FAILED - No profile found`
**Your profile doesn't exist yet.**

**Fix:**
1. Run this to create the profile:
```sql
INSERT INTO public.profiles (id, role, full_name)
SELECT 
  id,
  'platform_admin'::user_role,
  email
FROM auth.users
WHERE email = 'jeevansaigudela@gmail.com';
```

2. Verify:
```sql
SELECT email, role FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'jeevansaigudela@gmail.com';
```

### Step 3: Clear Session and Try Again

After fixing the database:

1. **Sign out** from http://localhost:3000
2. **Close all tabs** with localhost:3000
3. **Open a new tab**
4. Go to http://localhost:3000
5. **Sign in** with jeevansaigudela@gmail.com
6. Go to http://localhost:3000/dashboard
7. **Should work now!** ✅

---

## Alternative: Use Diagnostic Page

I created a diagnostic page earlier. Try accessing:

http://localhost:3000/diagnostic

This will show:
- ✅ Are you logged in?
- ✅ Your user ID and email
- ✅ Your current role
- ✅ What's blocking access

---

## Common Issues & Solutions

### Issue 1: "Not signed in"
**Symptom:** Page shows "Authentication Required"

**Solution:** 
- You're not logged in
- Go to http://localhost:3000
- Click "Sign In" (top-right)
- Sign in or create account

### Issue 2: "Customer role"
**Symptom:** Shows "Access Denied" + "You don't have permission"

**Solution:**
- Your role is still 'customer'
- Run the UPDATE SQL above
- Sign out and sign in again

### Issue 3: "Profile doesn't exist"
**Symptom:** Database shows no profile for your user

**Solution:**
- Run the INSERT SQL above
- Sign out and sign in again

### Issue 4: "Admin access works in incognito but not in regular browser"
**Symptom:** Dashboard works in private window but not normal window

**Solution:**
- Clear cookies for localhost:3000
- Or just use incognito until session expires
- Or restart your browser

---

## Manual Verification Steps

### 1. Check You're Signed In
1. Go to http://localhost:3000
2. Look at top-right corner
3. Should show your email or avatar
4. If shows "Sign In" button → you're not logged in

### 2. Check Your Role in Database
```sql
SELECT 
  u.email,
  p.role,
  CASE 
    WHEN p.role = 'platform_admin' THEN 'Full admin access ✓'
    WHEN p.role = 'seller_admin' THEN 'Seller admin access ✓'
    WHEN p.role = 'customer' THEN 'Customer only (no admin) ✗'
    ELSE 'No role assigned ✗'
  END as access_level
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'jeevansaigudela@gmail.com';
```

Expected: `role = platform_admin` and `access_level = Full admin access ✓`

### 3. Check RLS Policies Exist
```sql
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('products', 'orders', 'categories')
AND policyname ILIKE '%admin%';
```

Expected: `policy_count > 0` (should be 10+)

If 0:
- Run `ADMIN-RLS-POLICIES.sql`
- Run `RUN-ALL-FIXES-SIMPLE.sql`

---

## Still Not Working?

### Nuclear Option: Force Session Refresh

1. **Clear all site data:**
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Clear site data"
   - Click "Clear"

2. **Restart dev server:**
   ```bash
   # Stop the server (Ctrl+C in terminal)
   cd web
   npm run dev
   ```

3. **Sign in fresh:**
   - Go to http://localhost:3000
   - Sign in with jeevansaigudela@gmail.com
   - Go to http://localhost:3000/dashboard

---

## Quick Test

Run this in Supabase SQL Editor:

```sql
-- This should return 'platform_admin' if everything is correct
SELECT p.role
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'jeevansaigudela@gmail.com';
```

If it returns `platform_admin` but you still can't access, it's 100% a session cache issue. Just sign out and sign in again!

---

**Need help?** Run `DIAGNOSE-AND-FIX-ADMIN.sql` and tell me what you see in STEP 4!
