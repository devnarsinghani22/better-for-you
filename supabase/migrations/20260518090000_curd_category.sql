-- 2026-05-18: Curd category + criteria + 6 live products
-- Applied directly to cloud DB via PostgREST; this file is the record.

BEGIN;

INSERT INTO public.categories
  (slug, name, blurb, serving_size_g, serving_label, display_order, active, hero_image_url)
VALUES
  ('curd', 'Curd',
   'Only milk and active culture. At least 3g protein, less than 4.5g fat per 100g.',
   100, 'per 100g', 25, true,
   'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/categories/curd.jpg')
ON CONFLICT (slug) DO NOTHING;

WITH c AS (SELECT id FROM public.categories WHERE slug = 'curd')
INSERT INTO public.category_rules
  (category_id, code, description, evaluator_kind, threshold_value, threshold_unit, is_required, display_order)
SELECT c.id, v.code, v.description, v.evaluator_kind, v.tv, v.tu, true, v.ord
FROM c, (VALUES
  ('no_added_sugar',    'No added sugar',                  'threshold_lte', 0,             'g',        10),
  ('protein_min_3g',    'At least 3g protein per 100g',    'threshold_gte', 3,             'g',        20),
  ('fat_max_4_5g',      '4.5g or less fat per 100g',       'threshold_lte', 4.5,           'g',        30)
) AS v(code, description, evaluator_kind, tv, tu, ord)
ON CONFLICT DO NOTHING;

-- Brands (amul, id-fresh, milky-mist already exist from earlier seeds)
INSERT INTO public.brands (slug, name, website_url) VALUES
  ('heritage',        'Heritage',        NULL),
  ('country-delight', 'Country Delight', 'https://countrydelight.in/'),
  ('pride-of-cows',   'Pride of Cows',   'https://prideofcows.com/')
ON CONFLICT (slug) DO NOTHING;

-- 6 Live products (all label_tested, all 3 criteria pass)
WITH cat AS (SELECT id FROM public.categories WHERE slug='curd'),
     b   AS (SELECT id, slug FROM public.brands
             WHERE slug IN ('milky-mist','heritage','country-delight','amul','id-fresh','pride-of-cows'))
INSERT INTO public.products
  (slug, name, brand_id, category_id, variant_size, status, certification_method,
   product_photo_url, label_image_url, ingredients_raw, primary_buy_url, last_verified_at)
SELECT v.slug, v.name, b.id, cat.id, v.variant_size, 'Live'::public.product_status, 'label_tested'::public.certification_method,
       v.photo, v.label, v.ingredients, v.url, now()
FROM cat,
     b,
     (VALUES
       ('milky-mist-farm-fresh-curd',         'Farm Fresh Curd',     'milky-mist',      '1 kg Tub',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/milky-mist-farm-fresh-curd.jpg',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/milky-mist-farm-fresh-curd-label.jpg',
        'Pasteurised toned milk, Active lactic culture',
        'https://www.bigbasket.com/pd/40003156/milky-mist-natural-set-curd-1-kg-cup/'),
       ('heritage-total-curd',                'Total Curd',          'heritage',        '400g Cup',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/heritage-total-curd.jpg',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/heritage-total-curd-label.jpg',
        'Pasteurised Toned Milk & Active Lactic Cultures',
        'https://www.bigbasket.com/pd/225759/heritage-curd-premium-400-g-cup/'),
       ('country-delight-ghar-jaisa-dahi',    'Ghar Jaisa Dahi',     'country-delight', '400g',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/country-delight-ghar-jaisa-dahi.jpg',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/country-delight-ghar-jaisa-dahi-label.jpg',
        'Cow Milk, Active Lactic Culture',
        'https://countrydelight.in/products/milk-products/ghar-jaisa-dahi'),
       ('amul-masti-dahi',                    'Masti Dahi',          'amul',            '200g Cup',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/amul-masti-dahi.jpg',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/amul-masti-dahi-label.jpg',
        'Pasteurized Toned Milk, Milk Solids and Active Culture',
        'https://www.bigbasket.com/pd/30000356/amul-masti-dahi-200-g-cup/'),
       ('id-fresh-creamy-thick-curd',         'Creamy Thick Curd',   'id-fresh',        '400g Cup',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/id-fresh-creamy-thick-curd.jpg',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/id-fresh-creamy-thick-curd-label.jpg',
        'Pasteurized Toned Milk, Milk Solids and Active Lactic Culture',
        'https://www.bigbasket.com/pd/40200520/id-creamy-thick-curd-400-g-cup/'),
       ('pride-of-cows-curd',                 'Curd',                'pride-of-cows',   '320g Jar',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/pride-of-cows-curd.jpg',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/pride-of-cows-curd-label.jpg',
        'Pasteurized Toned Milk, Milk Solids and Active Culture',
        'https://www.bigbasket.com/pd/40274236/pride-of-cows-curd-made-from-fresh-milk-thick-creamy-no-preservatives-320-g-jar/')
     ) AS v(slug, name, brand_slug, variant_size, photo, label, ingredients, url)
WHERE b.slug = v.brand_slug
ON CONFLICT (slug) DO NOTHING;

COMMIT;
