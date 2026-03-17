-- Seed data for e-commerce schema
-- Run AFTER init_ecommerce.sql has been applied.

begin;

-- 1. BASIC SELLER
--------------------------------------------------------------------------------

-- Default seller similar to Doozypics-style store
insert into public.sellers (name, slug, description, city, state, country, is_active)
values (
  'DoozyStyle Studio',
  'doozystyle-studio',
  'Custom photo-to-art, acrylic prints, and personalized gifts.',
  'Hyderabad',
  'Telangana',
  'India',
  true
)
on conflict (slug) do nothing;

--------------------------------------------------------------------------------
-- 2. PRODUCT TYPES
--------------------------------------------------------------------------------

insert into public.product_types (code, name, description) values
  ('digital_painting', 'Digital Painting', 'Hand-crafted digital paintings from your photos.'),
  ('oil_painting', 'Oil Painting', 'Oil painting style artworks on canvas.'),
  ('pencil_art', 'Pencil Art', 'Black & white or color pencil sketch artworks.'),
  ('acrylic_print', 'Acrylic Print', 'High-quality acrylic mounted photo prints.'),
  ('photo_gift', 'Photo Gifts', 'Photo-based customized gifts like rocks, stands, and clocks.')
on conflict (code) do nothing;

--------------------------------------------------------------------------------
-- 3. CATEGORIES
--------------------------------------------------------------------------------

-- Top-level categories
insert into public.categories (name, slug, description, is_active)
values
  ('Photo To Art', 'photo-to-art', 'Turn your photos into stunning artworks.', true),
  ('Acrylic', 'acrylic', 'Premium acrylic prints and gifts.', true),
  ('Photo Gifts', 'photo-gifts', 'Unique personalized gifts based on your photos.', true)
on conflict (slug) do nothing;

-- 4. SAMPLE PRODUCTS & VARIANTS
--------------------------------------------------------------------------------
-- Digital Painting product
insert into public.products (
  seller_id, product_type_id, category_id,
  name, slug, short_description, long_description,
  is_customizable, base_price, currency, is_active,
  seo_title, seo_description
)
select
  (select id from public.sellers where slug = 'doozystyle-studio'),
  (select id from public.product_types where code = 'digital_painting'),
  (select id from public.categories where slug = 'photo-to-art'),
  'Digital Painting With Frame',
  'digital-painting-with-frame',
  'Turn your photo into a hand-crafted digital painting with frame.',
  'Upload your favorite portrait or family photo and our artists will convert it into a detailed digital painting. Includes premium framing and ready-to-hang finish.',
  true,
  2045.00,
  'INR',
  true,
  'Digital Painting With Frame | DoozyStyle Studio',
  'Custom digital painting from your photo with premium framing and fast delivery.'
on conflict (seller_id, slug) do nothing;

-- Variants for Digital Painting product (example sizes)
insert into public.product_variants (
  product_id, sku, title, attributes, price, compare_at_price, is_active
)
select
  p.id,
  'DP-12x18-FRAME',
  '12x18 inch | With Frame',
  jsonb_build_object('size', '12x18', 'frame', 'with_frame'),
  2045.00,
  2727.00,
  true
from public.products p
where p.slug = 'digital-painting-with-frame'
on conflict do nothing;

insert into public.product_variants (
  product_id, sku, title, attributes, price, compare_at_price, is_active
)
select
  p.id,
  'DP-18x24-FRAME',
  '18x24 inch | With Frame',
  jsonb_build_object('size', '18x24', 'frame', 'with_frame'),
  2576.00,
  3434.00,
  true
from public.products p
where p.slug = 'digital-painting-with-frame'
on conflict do nothing;

-- Acrylic print sample product
insert into public.products (
  seller_id, product_type_id, category_id,
  name, slug, short_description, long_description,
  is_customizable, base_price, currency, is_active,
  seo_title, seo_description
)
select
  (select id from public.sellers where slug = 'doozystyle-studio'),
  (select id from public.product_types where code = 'acrylic_print'),
  (select id from public.categories where slug = 'acrylic'),
  'Acrylic Square Photo Print',
  'acrylic-square-photo-print',
  'Square acrylic print of your photo with vibrant colors.',
  'Premium acrylic square print with polished edges, ideal for gifting and home decor. Just upload your photo and we handle the rest.',
  true,
  686.00,
  'INR',
  true,
  'Acrylic Square Photo Print | DoozyStyle Studio',
  'High-quality acrylic square photo print for home or office decor.'
on conflict (seller_id, slug) do nothing;

--------------------------------------------------------------------------------
-- 5. BASIC SEO SETTINGS
--------------------------------------------------------------------------------

insert into public.seo_settings (
  site_name,
  default_title_suffix,
  default_meta_description,
  default_og_image_url
)
values (
  'DoozyStyle Studio',
  ' | DoozyStyle Studio',
  'Custom photo-to-art, acrylic prints, and personalized gifts with fast delivery.',
  null
)
on conflict do nothing;

--------------------------------------------------------------------------------
-- 6. SIMPLE BANNER
--------------------------------------------------------------------------------

insert into public.banners (title, subtitle, image_url, cta_label, cta_url, is_active)
values (
  'Turn Photos into Art',
  'Digital paintings, acrylic prints & more',
  '/images/seed/banner-photo-to-art.jpg',
  'Shop Now',
  '/collections/photo-to-art',
  true
)
on conflict do nothing;

commit;

