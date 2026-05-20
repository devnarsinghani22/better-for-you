-- 2026-05-20: Reactivate peanut-butter category + 2 new high-protein/unsweetened products
-- Applied directly to cloud DB via PostgREST; this file is the record.

BEGIN;

-- 1) Reactivate peanut-butter category (was active=false)
UPDATE public.categories SET active = true WHERE slug = 'peanut-butter';

-- 2) New brands
INSERT INTO public.brands (slug, name, website_url) VALUES
  ('muscleblaze',     'MuscleBlaze',     'https://www.muscleblaze.com/'),
  ('the-whole-truth', 'The Whole Truth', 'https://www.thewholetruthfoods.com/')
ON CONFLICT (slug) DO NOTHING;

-- 3) Two Live products in peanut-butter category (id=5)
WITH cat AS (SELECT id FROM public.categories WHERE slug='peanut-butter'),
     b   AS (SELECT id, slug FROM public.brands WHERE slug IN ('muscleblaze','the-whole-truth'))
INSERT INTO public.products
  (slug, name, brand_id, category_id, variant_size, status, certification_method,
   product_photo_url, label_image_url, ingredients_raw, primary_buy_url, last_verified_at)
SELECT v.slug, v.name, b.id, cat.id, v.variant_size, 'Live'::public.product_status, 'label_tested'::public.certification_method,
       v.photo, v.label, v.ingredients, v.url, now()
FROM cat,
     b,
     (VALUES
       ('muscleblaze-high-protein-pb-crunchy',     'High Protein Peanut Butter (Crunchy)', 'muscleblaze',     '750g Unsweetened Crunchy',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/muscleblaze-high-protein-pb-crunchy.jpg',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/muscleblaze-high-protein-pb-crunchy-label.jpg',
        'Roasted Peanuts (85%) & Whey Protein Concentrate (15%)',
        'https://www.muscleblaze.com/sv/muscleblaze-high-protein-peanut-butter/SP-58705?navKey=VRNT-103843'),
       ('the-whole-truth-unsweetened-pb-crunchy',  'Unsweetened Peanut Butter (Crunchy)',  'the-whole-truth', '925g Crunchy',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/the-whole-truth-unsweetened-pb-crunchy.jpg',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/the-whole-truth-unsweetened-pb-crunchy-label.jpg',
        'Peanuts (100%)',
        'https://www.zepto.com/pn/the-whole-truth-unsweetened-peanut-butter/pvid/736d5a22-f815-4b2f-9b26-650177fd179d')
     ) AS v(slug, name, brand_slug, variant_size, photo, label, ingredients, url)
WHERE b.slug = v.brand_slug
ON CONFLICT (slug) DO NOTHING;

COMMIT;
