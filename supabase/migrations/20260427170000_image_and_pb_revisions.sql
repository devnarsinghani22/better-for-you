-- Revisions batch 2026-04-27:
-- 1. Front-pack photo replacements (broken Amul URLs, missing photos, wrong-image swaps).
-- 2. Nutrition label additions for products that had none.
-- 3. Strict peanut butter rule: Myfitness Crunchy → Unsweetened variant; Nut Roasters off Live (jaggery+salt fails PB rule).
-- 4. Pintola All Natural Crunchy added (100% peanuts).

BEGIN;

-- Front-pack photos
UPDATE products SET product_photo_url = 'https://images.openfoodfacts.org/images/products/890/126/218/0115/front_en.6.full.jpg'
  WHERE slug = 'amul-fresh-paneer';
UPDATE products SET product_photo_url = 'https://images.openfoodfacts.org/images/products/890/126/218/0115/front_en.6.full.jpg'
  WHERE slug = 'amul-malai-paneer';
UPDATE products SET product_photo_url = 'https://images.openfoodfacts.org/images/products/890/608/452/1597/front_en.10.full.jpg'
  WHERE slug = 'desi-farms-low-fat-paneer';
UPDATE products SET product_photo_url = 'https://www.paragmilkfoods.com/images/gowardhan/gow-paneer.png'
  WHERE slug = 'gowardhan-paneer';
UPDATE products SET product_photo_url = 'https://kikibix.com/cdn/shop/files/B09S6MGTXH.jpg?v=1757680967'
  WHERE slug = 'millet-chocolate-chip';
UPDATE products SET product_photo_url = 'https://earlyfoods.com/cdn/shop/files/13_93b071d9-a677-4076-be75-c8ca64c8322b.png?v=1750842417'
  WHERE slug = 'millet-rusk';

-- Nutrition labels
UPDATE products SET label_image_url = 'https://images.openfoodfacts.org/images/products/890/126/218/0115/nutrition_en.18.full.jpg'
  WHERE slug = 'amul-fresh-paneer';
UPDATE products SET label_image_url = 'https://images.openfoodfacts.org/images/products/890/126/218/0146/nutrition_en.5.full.jpg'
  WHERE slug = 'amul-malai-paneer';
UPDATE products SET label_image_url = 'https://images.openfoodfacts.org/images/products/890/608/452/1597/nutrition_en.12.full.jpg'
  WHERE slug = 'desi-farms-low-fat-paneer';
UPDATE products SET label_image_url = 'https://kikibix.com/cdn/shop/files/Millet_Choco_Chip.jpg?v=1757680967'
  WHERE slug = 'millet-chocolate-chip';

-- Convert Myfitness Crunchy to the strict-rule-passing Unsweetened variant
UPDATE products SET
  slug = 'myfitness-unsweetened-crunchy-pb',
  name = 'Natural Unsweetened Peanut Butter Crunchy',
  ingredients_raw = '100% Roasted Peanuts.',
  product_photo_url = 'https://myfitness.in/cdn/shop/files/1_8.jpg?v=1775730943',
  variant_size = '1.25 kg'
WHERE slug = 'myfitness-crunchy-pb';

-- Pull Nut Roasters Crunchy off Live (jaggery + Himalayan pink salt fails strict PB rule)
UPDATE products SET status = 'Retracted' WHERE slug = 'nut-roasters-crunchy-pb';

-- Add Pintola All Natural Crunchy (100% peanuts only)
INSERT INTO products (
  slug, name, brand_id, category_id, status, certification_method, rating,
  ingredients_raw, product_photo_url, variant_size,
  primary_buy_url, last_verified_at
)
SELECT
  'pintola-all-natural-crunchy-pb',
  'All Natural Peanut Butter Crunchy',
  (SELECT id FROM brands WHERE slug = 'pintola'),
  (SELECT id FROM categories WHERE slug = 'peanut-butter'),
  'Live'::product_status,
  'label_tested'::certification_method,
  'A+'::product_rating,
  '100% Roasted Peanuts.',
  'https://pintola.in/cdn/shop/files/All_Natural_Crunchy_350gm_600x600_2fc73edb-4697-4262-9082-cd0721f6b550.jpg?v=1733813298',
  '350 g',
  'https://pintola.in/products/all-natural-peanut-butter',
  now()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pintola-all-natural-crunchy-pb');

COMMIT;
