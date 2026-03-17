# Why Orders Don't Appear in "My Orders"

## The Issue

You placed an order as a **guest** (without logging in), then logged in later. Guest orders don't appear in "My Orders" page.

---

## Why This Happens

### Guest Order Flow:
1. User adds items to cart (NOT logged in)
2. User checks out
3. Order created with `profile_id = NULL` (guest order)
4. User receives order confirmation at `/order/DS-xxxxx`

### Later:
1. User logs in
2. Goes to "My Orders" page
3. Page shows only orders where `profile_id = your user ID`
4. **Guest orders (profile_id = NULL) don't show**

---

## Solution

### Option 1: Place New Orders While Logged In ✅ (Recommended)

1. **Sign in first** (before adding to cart)
2. Add items to cart
3. Checkout
4. Order will have your `profile_id`
5. **Will appear in "My Orders"** ✅

### Option 2: Access Guest Orders Directly

Your guest order still exists! Access it via the order number:

**Your order:** http://localhost:3000/order/DS-1770818984465

💡 **Tip:** Bookmark or save the order URL for future reference.

---

## What You Need to Do

### 1. Run the Complete RLS Policies

**File:** `COMPLETE-RLS-POLICIES.sql`

This ensures:
- ✅ Guest checkout works
- ✅ Logged-in checkout works  
- ✅ Orders show in "My Orders" (when logged in during checkout)
- ✅ Order confirmation pages work
- ✅ Admin dashboard works

### 2. Test Logged-In Checkout

1. Make sure you're **signed in** (check top-right corner)
2. Add a product to cart
3. Go to checkout
4. Place order
5. Check "My Orders" → **Order should appear!** ✅

---

## Technical Details

### Database Structure:

```
orders table:
├── profile_id (UUID, nullable)
│   ├── NULL = guest order
│   └── user-id-123 = logged-in order
```

### Query in "My Orders" Page:

```sql
SELECT * FROM orders 
WHERE profile_id = 'your-user-id'
```

This only returns orders where `profile_id` matches your user ID. Guest orders have `profile_id = NULL`, so they don't match.

---

## Future Enhancement (Optional)

Want to link guest orders to your account after logging in?

We could add:
- Email matching: Link orders where shipping email = your account email
- Order claiming: Enter order number to link to your account

**For now:** Just make sure to sign in before checking out! 🎯

---

## Quick Reference

| Scenario | Order Shows in "My Orders"? |
|----------|----------------------------|
| Guest checkout → Never logged in | ❌ No (no "My Orders" page - must be logged in) |
| Guest checkout → Login later | ❌ No (order has profile_id = NULL) |
| **Sign in → Checkout** | ✅ **Yes** (order has your profile_id) |

---

**Bottom line:** Sign in BEFORE checking out to see orders in "My Orders"! 🔐
