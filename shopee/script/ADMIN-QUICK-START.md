# 🚀 Admin Dashboard - Quick Start Guide

## Step 1: Run Database Migrations (REQUIRED)

Open your **Supabase SQL Editor** and run these files in order:

### 1.1 Basic Fixes (if not already run)
```sql
-- File: RUN-ALL-FIXES-SIMPLE.sql
-- This enables guest checkout and basic RLS policies
```

### 1.2 Admin RLS Policies (NEW - Required for Admin Dashboard)
```sql
-- File: ADMIN-RLS-POLICIES.sql
-- This enables all admin management features
```

### 1.3 Make Yourself Admin
```sql
-- File: MAKE-ADMIN-FIXED.sql
-- Replace email and run:
UPDATE public.profiles 
SET role = 'platform_admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'YOUR_EMAIL@gmail.com'
);
```

### 1.4 Verify Policies Were Created
```sql
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('products', 'categories', 'discounts', 'product_reviews')
ORDER BY tablename;
```

## Step 2: Access the Dashboard

1. Sign in to your account at http://localhost:3000
2. Navigate to http://localhost:3000/dashboard
3. You should see the full admin interface!

## Step 3: Explore Admin Features

### Dashboard Overview
- **URL**: `/dashboard`
- **Features**: Stats, recent orders, order distribution
- **What you'll see**: Revenue, orders, customers, products counts

### Product Management
- **URL**: `/dashboard/products`
- **Actions**:
  - Click "Add Product" to create new products
  - Click product name to edit
  - Use search to find products
  - Sort by clicking column headers

### Order Management
- **URL**: `/dashboard/orders`
- **Features**: View all customer orders
- **Info shown**: Order number, customer, payment status, amount

### Customer Management
- **URL**: `/dashboard/customers`
- **Features**: View all registered customers
- **Info shown**: Name, email, order count, join date

### Category Management
- **URL**: `/dashboard/categories`
- **Features**: View all product categories
- **Actions**: View categories, check status

### Discount Management
- **URL**: `/dashboard/discounts`
- **Features**: View all discount codes
- **Info shown**: Code, type, value, expiry, status

### Review Moderation
- **URL**: `/dashboard/reviews`
- **Features**: View and moderate customer reviews
- **Info shown**: Rating, review text, published status

### Seller Management (Platform Admin Only)
- **URL**: `/dashboard/sellers`
- **Features**: Manage seller accounts
- **Who can access**: Only platform_admin role

## Admin Features Summary

| Feature | What It Does | Who Can Access |
|---------|-------------|----------------|
| Dashboard | View stats and analytics | All admins |
| Products | Create, edit, delete products | All admins |
| Orders | View and manage all orders | All admins |
| Customers | View customer information | All admins |
| Categories | Manage product categories | All admins |
| Discounts | Create and manage coupons | All admins |
| Reviews | Moderate customer reviews | All admins |
| Sellers | Manage seller accounts | Platform admin only |
| Settings | Site configuration | All admins |

## Troubleshooting

### "Access Denied" Message
**Problem**: You see "Access Denied" when accessing /dashboard

**Solution**: 
1. Check your role: `SELECT role FROM profiles WHERE id = auth.uid()`
2. Should be `platform_admin` or `seller_admin`
3. Run `MAKE-ADMIN-FIXED.sql` to fix

### "No products found"
**Problem**: Products page is empty

**Solution**:
1. Click "Add Product" button
2. Fill in product details
3. Make sure a seller exists in `sellers` table
4. Or insert a seller:
```sql
INSERT INTO sellers (name, slug, is_active)
VALUES ('DoozyStyle Studio', 'doozystyle-studio', true);
```

### "Unauthorized" API Error
**Problem**: Getting 403 errors when creating products

**Solution**:
1. Run `ADMIN-RLS-POLICIES.sql` in Supabase SQL Editor
2. Verify your role is admin
3. Sign out and sign back in to refresh session

### Dashboard Not Loading Stats
**Problem**: Dashboard shows 0 for all stats

**Solution**: This is normal if you have no data yet
1. Create some test orders through the frontend
2. Stats will update automatically
3. Try placing a test order at http://localhost:3000

### Can't Create Products - Missing Seller
**Problem**: "seller_id is required" error

**Solution**: Create a seller first:
```sql
INSERT INTO sellers (name, slug, contact_email, is_active)
VALUES (
  'DoozyStyle Studio',
  'doozystyle-studio',
  'contact@doozystyle.com',
  true
);
```

## Next Steps

1. ✅ **Create a Seller** (if none exists)
2. ✅ **Add Categories** (insert into `categories` table)
3. ✅ **Create Products** (use admin dashboard)
4. ✅ **Test Frontend** (make sure products appear)
5. ✅ **Place Test Orders** (verify order flow)
6. ✅ **Check Dashboard Stats** (should show data)

## Database Quick Inserts

### Add a Sample Seller
```sql
INSERT INTO sellers (name, slug, description, contact_email, is_active)
VALUES (
  'DoozyStyle Studio',
  'doozystyle-studio',
  'Professional custom artwork and paintings',
  'contact@doozystyle.com',
  true
)
RETURNING id, name, slug;
```

### Add Sample Categories
```sql
INSERT INTO categories (name, slug, description, is_active) VALUES
('Photo to Art', 'photo-to-art', 'Transform your photos into beautiful artwork', true),
('Acrylic Prints', 'acrylic', 'Modern acrylic prints', true),
('Photo Gifts', 'photo-gifts', 'Personalized photo gifts', true)
RETURNING id, name, slug;
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `ADMIN-RLS-POLICIES.sql` | All security policies for admin operations |
| `RUN-ALL-FIXES-SIMPLE.sql` | Basic checkout and cart RLS policies |
| `MAKE-ADMIN-FIXED.sql` | Make yourself an admin |
| `ADMIN-DASHBOARD-COMPLETE.md` | Detailed implementation documentation |
| `migration-log.md` | Track all database changes |

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs in the dashboard
3. Verify RLS policies are enabled
4. Ensure you're logged in as admin
5. Try signing out and back in

---

**🎉 Your admin dashboard is ready!** Start by creating a seller, then add some products, and manage your entire e-commerce platform from one place.

**Dashboard URL**: http://localhost:3000/dashboard
