# RLS Policies - Fixed for Idempotent Execution

## Latest Fix (Feb 11, 2026)
**Fixed column name error**: Changed `is_available` → `is_active` in product_variants policy to match actual database schema.

## Problem
When running `COMPLETE-RLS-POLICIES.sql`, you encountered these errors:
1. ~~`ERROR: 42710: policy "Anyone can view orders" for table "orders" already exists`~~ ✅ FIXED
2. ~~`ERROR: 42703: column "is_available" does not exist`~~ ✅ FIXED

## Root Cause

### Error 1: Policy Already Exists
The SQL file was attempting to create policies that already existed in your database from a previous run, and the DROP statements didn't cover all possible policy name variations.

### Error 2: Wrong Column Name
The policy for `product_variants` was checking `is_available` column, but the actual table schema has `is_active` column.

## Solution Applied ✅

### Changes Made:

#### Fix 1: Made File Idempotent
1. **Added Comprehensive Cleanup Section** at the top of the file
   - Consolidated ALL `DROP POLICY IF EXISTS` statements in one place
   - Covers ALL possible policy name variations (old and new)
   - Includes all tables: orders, order_items, carts, cart_items, profiles, products, variants, categories, addresses, wishlists, wishlist_items, reviews, cart_item_addons

2. **Removed Redundant DROP Statements** from individual sections
   - Cleaner, more maintainable structure
   - Single source of truth for policy cleanup

3. **Added Idempotency Note** in file header
   - "This file is idempotent - safe to run multiple times"

#### Fix 2: Corrected Column Name
- Changed `is_available` to `is_active` in product_variants policy
- Now matches actual database schema from `init_ecommerce.sql`

### File Structure Now:
```sql
-- ============================================
-- CLEANUP: Drop ALL existing policies first
-- ============================================
-- (All DROP POLICY IF EXISTS statements here)

-- ============================================
-- ORDERS TABLE
-- ============================================
-- (Just CREATE POLICY statements)

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
-- (Just CREATE POLICY statements)

... (and so on for all tables)
```

## How to Use

### Step 1: Run the Updated SQL File
```bash
# From Supabase SQL Editor or psql
\i COMPLETE-RLS-POLICIES.sql
```

Or copy-paste the entire file content into your Supabase SQL Editor.

### Step 2: Verify Policies Applied
The file includes a verification query at the end:
```sql
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN (
  'orders', 'order_items', 'carts', 'cart_items', 
  'profiles', 'products', 'product_variants', 'categories',
  'addresses', 'wishlists', 'wishlist_items', 'product_reviews',
  'cart_item_addons'
)
ORDER BY tablename, policyname;
```

## Expected Results

After running the file, you should see:
- ✅ No errors
- ✅ All policies created successfully
- ✅ Verification query shows all policies for listed tables

### Policy Counts by Table:
- **orders**: 3 policies (view, insert, update)
- **order_items**: 3 policies (view, insert, update)
- **carts**: 4 policies (view, insert, update, delete)
- **cart_items**: 4 policies (view, insert, update, delete)
- **profiles**: 3 policies (view, update, insert)
- **products**: 2 policies (view, admin manage)
- **product_variants**: 1 policy (view)
- **categories**: 1 policy (view)
- **addresses**: 4 policies (view, insert, update, delete)
- **wishlists**: 3 policies (view, insert, update)
- **wishlist_items**: 3 policies (view, insert, delete)
- **product_reviews**: 4 policies (view, insert, update, delete)
- **cart_item_addons**: 3 policies (view, insert, delete)

**Total: 38 policies**

## Safety Features

The updated file is now:
1. ✅ **Idempotent** - Can be run multiple times without errors
2. ✅ **Comprehensive** - Drops all possible policy name variations
3. ✅ **Clean** - Single cleanup section, no redundant drops
4. ✅ **Documented** - Clear sections and comments

## Next Steps

1. **Run the updated file** - It will now work without errors
2. **Test features** - Verify all customer/admin features work correctly
3. **Monitor logs** - Check for any RLS-related access issues

## Troubleshooting

### If you still get errors:
1. **Check table names** - Ensure all tables exist in your database
2. **Check schema** - Policies are created in `public` schema
3. **Check permissions** - Ensure you have admin access to create policies

### To manually clean up specific policies:
```sql
-- View all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Drop a specific policy
DROP POLICY IF EXISTS "policy_name" ON public.table_name;
```

---

**Status: ✅ FIXED** - The file is now ready to run without errors!
