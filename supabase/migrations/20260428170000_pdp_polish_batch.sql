-- 2026-04-28 PDP polish batch:
-- 1. Fix '100 per cent' → '100%' wording in peanut butter rule.
-- 2. Replace product photos / labels per user feedback.
-- 3. Populate nutrition JSONB for products needing professional labels.

BEGIN;

-- 1. Wording fix
UPDATE public.category_rules
SET description = '100% peanuts. Or peanuts plus whey.'
WHERE code = 'pb_pure_ingredients';

-- 2. Image swaps
-- Naturally Yours Quinoa Noodles: was a cooked-dish photo, swap to clean back-of-pack
UPDATE public.products
SET product_photo_url = 'https://naturallyyours.in/cdn/shop/files/Copy_of_Quinoa_Noodles_180G_2.png?v=1765593224'
WHERE slug = 'quinoa-noodles-naturally';

-- Early Foods Multigrain Millet Rusk: add the back-of-pack as nutrition label
UPDATE public.products
SET label_image_url = 'https://earlyfoods.com/cdn/shop/files/RuskShopify_3_38cfbbae-67a7-4faa-8c93-20a9e04cf7fd.png?v=1767869591'
WHERE slug = 'millet-rusk';

-- Health Factory Zero Maida Rusk: better hero shot + clean nutrition table
UPDATE public.products
SET product_photo_url = 'https://www.thehealthfactory.in/cdn/shop/files/1_d9df678f-64a1-44d6-93d2-8b94dd4bd592.webp?v=1769065209',
    label_image_url   = 'https://www.thehealthfactory.in/cdn/shop/files/Group_900_18.webp?v=1765279308'
WHERE slug = 'zero-maida-rusk';

-- 3. Nutrition JSONB (per 100g where available)
UPDATE public.products SET nutrition = '{
  "per": "100g",
  "rows": [
    {"label": "Energy",          "value": 314,  "unit": "kcal", "bold": true},
    {"label": "Protein",         "value": 20,   "unit": "g",    "bold": true},
    {"label": "Total Fat",       "value": 25,   "unit": "g",    "bold": true},
    {"label": "Saturated Fat",   "value": 15,   "unit": "g",    "indent": true},
    {"label": "Trans Fat",       "value": 0,    "unit": "g",    "indent": true},
    {"label": "Cholesterol",     "value": 65,   "unit": "mg"},
    {"label": "Carbohydrate",    "value": 4.5,  "unit": "g",    "bold": true},
    {"label": "Total Sugars",    "value": 4.5,  "unit": "g",    "indent": true},
    {"label": "Added Sugar",     "value": 0,    "unit": "g",    "indent": true},
    {"label": "Sodium",          "value": 22,   "unit": "mg"},
    {"label": "Calcium",         "value": 480,  "unit": "mg"}
  ]
}'::jsonb
WHERE slug = 'amul-fresh-paneer';

UPDATE public.products SET nutrition = '{
  "per": "100g",
  "rows": [
    {"label": "Energy",          "value": 315,  "unit": "kcal", "bold": true},
    {"label": "Protein",         "value": 20,   "unit": "g",    "bold": true},
    {"label": "Total Fat",       "value": 25,   "unit": "g",    "bold": true},
    {"label": "Carbohydrate",    "value": 4.5,  "unit": "g",    "bold": true},
    {"label": "Total Sugars",    "value": 4.5,  "unit": "g",    "indent": true},
    {"label": "Added Sugar",     "value": 0,    "unit": "g",    "indent": true},
    {"label": "Dietary Fibre",   "value": 0,    "unit": "g"}
  ]
}'::jsonb
WHERE slug = 'amul-malai-paneer';

UPDATE public.products SET nutrition = '{
  "per": "100g",
  "rows": [
    {"label": "Energy",          "value": 156,  "unit": "kcal", "bold": true},
    {"label": "Protein",         "value": 17,   "unit": "g",    "bold": true},
    {"label": "Total Fat",       "value": 8,    "unit": "g",    "bold": true},
    {"label": "Carbohydrate",    "value": 4,    "unit": "g",    "bold": true}
  ]
}'::jsonb
WHERE slug = 'desi-farms-low-fat-paneer';

UPDATE public.products SET nutrition = '{
  "per": "100g",
  "rows": [
    {"label": "Energy",          "value": 639,  "unit": "kcal", "bold": true},
    {"label": "Protein",         "value": 30,   "unit": "g",    "bold": true},
    {"label": "Total Fat",       "value": 49,   "unit": "g",    "bold": true},
    {"label": "Saturated Fat",   "value": 7,    "unit": "g",    "indent": true},
    {"label": "Trans Fat",       "value": 0,    "unit": "g",    "indent": true},
    {"label": "MUFA + PUFA",     "value": 41,   "unit": "g",    "indent": true},
    {"label": "Carbohydrate",    "value": 18,   "unit": "g",    "bold": true},
    {"label": "Total Sugars",    "value": 3,    "unit": "g",    "indent": true},
    {"label": "Added Sugar",     "value": 0,    "unit": "g",    "indent": true},
    {"label": "Dietary Fibre",   "value": 9,    "unit": "g"},
    {"label": "Sodium",          "value": 19,   "unit": "mg"}
  ]
}'::jsonb
WHERE slug = 'pintola-all-natural-crunchy-pb';

UPDATE public.products SET nutrition = '{
  "per": "100g",
  "rows": [
    {"label": "Energy",          "value": 622,  "unit": "kcal", "bold": true},
    {"label": "Protein",         "value": 31,   "unit": "g",    "bold": true},
    {"label": "Total Fat",       "value": 50,   "unit": "g",    "bold": true},
    {"label": "Saturated Fat",   "value": 7,    "unit": "g",    "indent": true},
    {"label": "Trans Fat",       "value": 0,    "unit": "g",    "indent": true},
    {"label": "Carbohydrate",    "value": 14,   "unit": "g",    "bold": true},
    {"label": "Total Sugars",    "value": 3,    "unit": "g",    "indent": true},
    {"label": "Added Sugar",     "value": 0,    "unit": "g",    "indent": true},
    {"label": "Dietary Fibre",   "value": 8,    "unit": "g"},
    {"label": "Sodium",          "value": 0,    "unit": "mg"}
  ]
}'::jsonb
WHERE slug = 'myfitness-unsweetened-crunchy-pb';

COMMIT;
