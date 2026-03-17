# 🔐 Set Up Admin Access

## Why "Access Denied"?

The dashboard checks if your user has `role = 'admin'` in the profiles table. You need to set this role to access the admin dashboard.

---

## ✅ **Quick Fix (2 Minutes)**

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/pjyytokbwvnvrsoibdbi/editor
2. Click **SQL Editor** in left sidebar
3. Click **New Query**

---

### Step 2: Run This SQL

Copy and paste this entire block:

```sql
-- Make yourself admin
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email), 
  'admin'
FROM auth.users 
WHERE email = 'jeevansaigudela@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';

-- Verify it worked
SELECT id, email, role, full_name 
FROM public.profiles 
WHERE email = 'jeevansaigudela@gmail.com';
```

### Step 3: Click RUN (or press Ctrl+Enter)

You should see:
```
| id          | email                       | role  | full_name              |
|-------------|----------------------------|-------|------------------------|
| 9b8fb889... | jeevansaigudela@gmail.com  | admin | jeevansaigudela@gmail.com |
```

---

### Step 4: Refresh Dashboard

1. Go to: http://localhost:3000/dashboard/orders
2. Press Ctrl+Shift+R (hard refresh)
3. You should now see the admin dashboard! ✅

---

## 🎯 **Alternative: Using Supabase UI**

### Via Table Editor:

1. Go to: https://supabase.com/dashboard/project/pjyytokbwvnvrsoibdbi/editor
2. Click **Table Editor** in left sidebar
3. Click on **profiles** table
4. Find the row with your email (`jeevansaigudela@gmail.com`)
5. Click on the **role** cell
6. Change it to: `admin`
7. Press Enter to save
8. Refresh your dashboard page

---

## 📊 **User Roles Explained**

| Role | Permissions |
|------|-------------|
| `customer` | Default role - can shop, view own orders |
| `seller` | Can view all orders, manage inventory |
| `admin` | Full access - all orders, all features |
| `null` | Same as customer |

---

## 🔍 **Verify Admin Access Works**

After running the SQL:

1. ✅ Go to `/dashboard/orders`
2. ✅ Should see "Order Management" page
3. ✅ Shows "Admin Access" badge
4. ✅ Lists all orders in a table

---

## 🛠️ **Make Multiple Users Admin**

To add more admins:

```sql
UPDATE public.profiles 
SET role = 'admin'
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'jeevansaigudela@gmail.com'
);
```

---

## 🚨 **Common Issues**

### Issue 1: "No rows returned"
**Cause:** Profile doesn't exist yet  
**Fix:** The INSERT query above will create it

### Issue 2: "Still shows Access Denied"
**Cause:** Browser cached the old response  
**Fix:** Hard refresh (Ctrl+Shift+R) or clear browser cache

### Issue 3: "SQL error"
**Cause:** Profiles table might not exist  
**Fix:** Make sure you ran `init_ecommerce.sql` first

---

## 📝 **Quick Copy-Paste:**

Just run this one line in Supabase SQL Editor:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'jeevansaigudela@gmail.com';
```

If that doesn't work (profile doesn't exist), run the full SQL from `MAKE-ADMIN.sql`

---

## ✅ **After Running SQL:**

1. ✅ Refresh `/dashboard/orders`
2. ✅ You should see admin dashboard
3. ✅ "Access Denied" message is gone
4. ✅ Can view all orders

---

**Just run the SQL in Supabase and refresh! It takes 10 seconds!** 🚀
