# 🚨 Quick Fix: Can't Retrieve Data After Adding Anon Key

## Problem
After pasting the correct anon key, you still can't retrieve data from Supabase.

## Cause
**Row Level Security (RLS)** is enabled and blocking access.

---

## 🔧 QUICK FIX (2 Options)

### Option 1: Disable RLS Temporarily (Fast, Less Secure)

**Go to Supabase Dashboard:**

1. Open: https://supabase.com/dashboard/project/pjyytokbwvnvrsoibdbi/editor
2. Click **SQL Editor** in left sidebar
3. Paste this SQL:

```sql
-- Disable RLS on catalog tables
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customization_options DISABLE ROW LEVEL SECURITY;
```

4. Click **RUN** button
5. Refresh your website

---

### Option 2: Enable RLS with Policies (Recommended, More Secure)

**Run the SQL file I created:**

1. Go to Supabase Dashboard → **SQL Editor**
2. Open the file: `RLS-FIX.sql` (in your project root)
3. Copy the ENTIRE file contents
4. Paste in SQL Editor
5. Click **RUN**

This will:
- ✅ Allow anyone to READ products/categories
- ✅ Allow users to manage their own carts
- ✅ Allow users to view their own orders
- ✅ Keep data secure

---

## ✅ How to Verify It's Fixed

### Test 1: Check in Browser
```
1. Go to: http://localhost:3000
2. Open DevTools Console (F12)
3. Refresh page
4. You should see products loading (no errors)
```

### Test 2: Query Supabase Directly
```sql
-- Run this in SQL Editor
SELECT * FROM public.products LIMIT 5;
```

If you see products → RLS is working correctly

---

## 🔍 Common Error Messages

### Error: "new row violates row-level security policy"
**Fix:** RLS is blocking inserts. Run Option 2 SQL above.

### Error: "permission denied for table products"
**Fix:** Anon key doesn't have access. Run Option 1 or 2 SQL above.

### Error: "relation 'products' does not exist"
**Fix:** You haven't run the seed SQL yet. Go back and run `seed_ecommerce.sql`

---

## 📋 Step-by-Step Checklist

- [ ] Anon key is correct in `.env.local`
- [ ] Dev server restarted after changing `.env.local`
- [ ] RLS policies created (run `RLS-FIX.sql`)
- [ ] Seed data exists (run `seed_ecommerce.sql` if not)
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] No errors in browser console

---

## 🎯 Expected Behavior After Fix

### Home Page
- ✅ Shows products in "Popular Art Styles" section
- ✅ No errors in console

### Collections Page
- ✅ `/collections/photo-to-art` shows product list
- ✅ Products have images, titles, prices

### Product Page
- ✅ `/products/digital-painting-with-frame` shows product details
- ✅ Variants are selectable
- ✅ Add to cart works

### Cart & Checkout
- ✅ Can add items to cart
- ✅ Can view cart
- ✅ Can proceed to checkout

---

## 🚀 Quick Commands

### Restart Dev Server
```bash
cd web
npm run dev
```

### Check Environment Variables
```bash
cat web/.env.local
```

Should show:
```
NEXT_PUBLIC_SUPABASE_URL=https://pjyytokbwvnvrsoibdbi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (long string)
```

---

## 💡 Still Having Issues?

### Check Browser Console
1. Press F12
2. Go to Console tab
3. Look for errors
4. Common errors:

**"Invalid API key"** → Wrong anon key, check `.env.local`
**"Failed to fetch"** → Supabase URL wrong or network issue
**"Row level security"** → Run RLS fix SQL above

### Check Network Tab
1. F12 → Network tab
2. Refresh page
3. Look for requests to Supabase
4. Check if they return 200 OK or errors

---

## 📞 Need More Help?

If still not working, check:
1. ✅ Anon key is correct (starts with `eyJ`, very long)
2. ✅ `.env.local` saved and server restarted
3. ✅ RLS SQL executed successfully
4. ✅ Seed data exists in database
5. ✅ No JavaScript errors in console

---

**Most likely you just need to run the RLS SQL! Copy `RLS-FIX.sql` and paste in Supabase SQL Editor, then click RUN.** 🚀
