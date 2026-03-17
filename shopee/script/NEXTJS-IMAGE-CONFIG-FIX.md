# Next.js Image Configuration Fix

## Error Fixed
```
Invalid src prop on `next/image`, hostname "pjyytokbwvnvrsoibdbi.supabase.co" is not configured
```

## Solution Applied ✅

### Updated File: `web/next.config.ts`

Added Supabase storage domain to Next.js image configuration:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pjyytokbwvnvrsoibdbi.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

## Why This is Needed

Next.js Image component (`<Image>`) provides automatic:
- Image optimization
- Lazy loading
- Responsive sizing
- Format conversion (WebP)

For security, it requires external domains to be explicitly allowed in `next.config.ts`.

## Pattern Explanation

```typescript
remotePatterns: [
  {
    protocol: 'https',              // Only HTTPS allowed
    hostname: 'your-project.supabase.co',  // Your Supabase project
    port: '',                       // No specific port
    pathname: '/storage/v1/object/public/**',  // Only public storage
  },
]
```

The `pathname` pattern `/storage/v1/object/public/**` allows all public storage objects while blocking private ones.

## Next Steps

### 1. Restart Development Server ⚠️

**IMPORTANT:** You must restart your Next.js dev server for this change to take effect!

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 2. Verify the Fix

After restarting, the product images should now display correctly without errors.

## For Production Deployment

This configuration will work automatically in production. No additional steps needed.

## Adding More Domains (If Needed)

If you use images from other sources (e.g., CDN, external APIs), add them to the array:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'pjyytokbwvnvrsoibdbi.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
    {
      protocol: 'https',
      hostname: 'cdn.example.com',
      pathname: '/**',
    },
  ],
},
```

## Troubleshooting

### Images Still Not Loading?
1. ✅ Verify server was restarted
2. ✅ Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. ✅ Check image URLs in browser console
4. ✅ Verify images exist in Supabase Storage

### Wrong Hostname?
If your Supabase project URL is different:
1. Check your `.env.local` file for `NEXT_PUBLIC_SUPABASE_URL`
2. Extract the hostname (e.g., `your-project.supabase.co`)
3. Update `hostname` in `next.config.ts`

---

**Status: ✅ FIXED** - Images will load after server restart!
