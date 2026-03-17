# Fix: Checkout Not Working (Guest Checkout Support)

## Problem
- Checkout failing with error: `"Failed to create order"`
- Root cause: `profile_id` column in `orders` table is `NOT NULL`, but guest users have no profile

## Error in Terminal
```
Error creating order {
  code: '23502',
  message: 'null value in column "profile_id" of relation "orders" violates not-null constraint'
}
```

## Solution
Make `profile_id` nullable to support guest checkout (users can checkout without logging in).

## Steps to Fix

### 1. Run the Migration SQL

Go to your **Supabase Dashboard** → **SQL Editor** and run this:

```sql
ALTER TABLE public.orders 
ALTER COLUMN profile_id DROP NOT NULL;
```

Or run the file: `FIX-GUEST-CHECKOUT.sql`

### 2. Verify the Fix

After running the SQL, verify it worked:

```sql
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'profile_id';
```

**Expected result:** `is_nullable = 'YES'`

### 3. Test Checkout

1. Add items to cart
2. Go to checkout (`http://localhost:3000/checkout`)
3. Fill in shipping details
4. Click "Place Order"
5. Should redirect to order confirmation page

## What This Changes

**Before:**
- Users MUST be logged in to checkout
- Guest checkout fails with database error

**After:**
- ✅ Logged-in users can checkout (profile_id saved)
- ✅ Guest users can checkout (profile_id is null)
- ✅ Order still saves shipping address and contact info

## Impact

- **Guest checkout now works!** Users don't need to create an account
- Logged-in users still get their orders linked to their profile
- You can still track orders via `order_number`
- Order history page (`/account/orders`) only shows orders for logged-in users

---

**Status:** Run the SQL migration to enable guest checkout ✅
