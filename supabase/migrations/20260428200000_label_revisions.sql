-- 2026-04-28 batch 5: revert to actual pack-photo labels, fix Amul Malai duplicate,
-- restore quinoa noodles photo, clear nutrition JSONB so PDPs prefer label images.

BEGIN;

-- 1. Amul Malai: was using same image as Amul Fresh. Use the correct barcode (0146) front.
UPDATE public.products
SET product_photo_url = 'https://images.openfoodfacts.org/images/products/890/126/218/0146/front_en.3.full.jpg',
    label_image_url   = 'https://images.openfoodfacts.org/images/products/890/126/218/0146/nutrition_en.5.full.jpg'
WHERE slug = 'amul-malai-paneer';

-- 2. Amul Fresh: keep current photos (already barcode 0115).
-- Just ensure label points to OFF nutrition image.
UPDATE public.products
SET label_image_url = 'https://images.openfoodfacts.org/images/products/890/126/218/0115/nutrition_en.18.full.jpg'
WHERE slug = 'amul-fresh-paneer';

-- 3. Desi Farms: keep OFF nutrition image
UPDATE public.products
SET label_image_url = 'https://images.openfoodfacts.org/images/products/890/608/452/1597/nutrition_en.12.full.jpg'
WHERE slug = 'desi-farms-low-fat-paneer';

-- 4. Pintola + Myfitness Unsweetened: use back-of-pack images uploaded to Supabase Storage
UPDATE public.products
SET label_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/labels/pintola-all-natural-crunchy-pb.jpg'
WHERE slug = 'pintola-all-natural-crunchy-pb';

UPDATE public.products
SET label_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/labels/myfitness-unsweetened-crunchy-pb.jpg'
WHERE slug = 'myfitness-unsweetened-crunchy-pb';

-- 5. Quinoa Noodles: revert product photo back to original cooked-dish hero
UPDATE public.products
SET product_photo_url = 'https://naturallyyours.in/cdn/shop/files/6_9211ea6e-b4f6-4948-8714-41bc42dda1e5.png?v=1727815745'
WHERE slug = 'quinoa-noodles-naturally';

-- 6. Clear nutrition JSONB on products that now have proper label images, so PDPs render
-- the photo, not the typographic card.
UPDATE public.products
SET nutrition = NULL
WHERE slug IN (
  'amul-fresh-paneer',
  'amul-malai-paneer',
  'desi-farms-low-fat-paneer',
  'pintola-all-natural-crunchy-pb',
  'myfitness-unsweetened-crunchy-pb',
  'milky-mist-high-protein-paneer'
);

COMMIT;
