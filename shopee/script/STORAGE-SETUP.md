# Supabase Storage Setup Instructions

## Storage Bucket Configuration

Before using file uploads, you need to create storage buckets in Supabase:

### 1. Go to Supabase Dashboard
Navigate to: https://pjyytokbwvnvrsoibdbi.supabase.co/project/default/storage/buckets

### 2. Create Required Buckets

#### Bucket: `products`
- **Name:** `products`
- **Public:** ✅ Yes (for product images)
- **File size limit:** 10MB
- **Allowed MIME types:** `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`

#### Bucket: `uploads`
- **Name:** `uploads`
- **Public:** ❌ No (for customer uploads)
- **File size limit:** 50MB
- **Allowed MIME types:** All

#### Bucket: `artwork`
- **Name:** `artwork`
- **Public:** ❌ No (for artwork files)
- **File size limit:** 50MB
- **Allowed MIME types:** All

### 3. Set Storage Policies (RLS)

#### For `products` bucket (Public):
```sql
-- Allow authenticated admins to upload
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('platform_admin', 'seller_admin')
);

-- Allow public to read
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow admins to delete
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('platform_admin', 'seller_admin')
);
```

#### For `uploads` bucket (Private):
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (auth.uid() = owner OR
   (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('platform_admin', 'seller_admin'))
);

-- Allow users to view their own uploads or admins to view all
CREATE POLICY "Users can view own uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (auth.uid() = owner OR
   (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('platform_admin', 'seller_admin'))
);
```

#### For `artwork` bucket (Private):
```sql
-- Allow admins to upload artwork
CREATE POLICY "Admins can upload artwork"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'artwork' AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('platform_admin', 'seller_admin')
);

-- Allow admins and order owners to view
CREATE POLICY "Admins and customers can view artwork"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'artwork');
```

### 4. Test Upload

After creating buckets, test the upload:
1. Go to `/dashboard/products/new`
2. The image upload section should now work
3. Upload an image and verify it appears in Supabase Storage

### 5. Environment Variables (Already Set)

Your `.env.local` already has the required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://pjyytokbwvnvrsoibdbi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

No additional variables needed for storage!

### 6. Bucket Structure

```
products/
  └── images/
      ├── 1707123456789-abc123.jpg
      ├── 1707123456790-def456.png
      └── ...

uploads/
  └── customer-files/
      ├── 1707123456789-photo.jpg
      └── ...

artwork/
  └── designs/
      ├── order-123/
      │   ├── v1.png
      │   ├── v2.png
      │   └── ...
      └── ...
```

### Troubleshooting

**Error: "Bucket not found"**
- Solution: Create the bucket in Supabase dashboard

**Error: "new row violates row-level security policy"**
- Solution: Run the RLS policies above in SQL Editor

**Error: "File too large"**
- Solution: Check bucket size limits in Supabase dashboard

**Images not displaying:**
- Solution: Ensure bucket is set to Public
- Or generate signed URLs for private buckets
