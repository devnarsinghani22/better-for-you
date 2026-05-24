-- 2026-05-24: Bread section — multigrain + protein — staged as Draft for review.
-- Applied via PostgREST; this file is the record.
--
-- Modelled on the Paneer "compound category": a parent `bread` card on the
-- homepage nests two variant sections, `bread-multigrain` and `bread-protein`.
--
-- Categories are inserted active=false with a sentinel display_order >= 900.
-- Categories have no Draft status, and the homepage renders active categories
-- on BOTH prod and staging — so to preview bread on the staging URL without it
-- leaking to foodpharmer.health we gate it via lib/categories/visibility.ts
-- (preview shows active OR display_order >= 900; prod shows active only).
-- Products are status='Draft' so the env-aware product visibility helper keeps
-- them off prod until promoted to 'Live' + categories flipped active=true.
--
-- bread-multigrain (criteria: no colour, no maida, no preservatives, >=6g fibre/100g):
--   • The Health Factory — Zero Maida Super Multigrain Bread (250g)  [BigBasket]
--   • Modern — Baker's Loaf Multigrain Bread (350g)                   [Zepto]
--   • The Baker's Dozen — Multigrain Loaf (375g)                      [Zepto]
-- bread-protein (criteria: no colour, no maida, no preservatives, >=15g protein/100g):
--   • Protein Chef — Protein Multigrain Bread (270g)                  [Zepto]
--   • The Health Factory — Zero Maida Protein Bread (250g)            [Zepto]
--   • The Baker's Dozen — Zero Maida Protein Bread (240g)             [Swiggy Instamart]
--
-- NOTE: Modern's Baker's Loaf Multigrain has Dietary Fibre 1.51g/100g (read from
-- the pack panel on Zepto), which FAILS the >=6g fibre criterion. Kept as Draft
-- on staging for review; recommend dropping unless the criterion is revisited.

BEGIN;

INSERT INTO public.categories
  (slug, name, serving_size_g, serving_label, blurb, display_order, active, hero_image_url)
VALUES
  ('bread', 'Bread', 100, 'per 100g',
   'No-maida breads — multigrain and high-protein — that pass our label checks.',
   900, false,
   'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/categories/bread.jpg'),
  ('bread-multigrain', 'Bread · Multigrain', 100, 'per 100g',
   'Multigrain breads with no maida, no preservatives, and real fibre.',
   901, false,
   'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/categories/bread.jpg'),
  ('bread-protein', 'Bread · Protein', 100, 'per 100g',
   'High-protein breads with no maida and no preservatives.',
   902, false,
   'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/categories/bread.jpg')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.brands (slug, name, website_url) VALUES
  ('modern',           'Modern',             'https://www.modernfoods.co.in/'),
  ('the-bakers-dozen', 'The Baker''s Dozen', 'https://thebakersdozen.in/'),
  ('protein-chef',     'Protein Chef',       NULL)
ON CONFLICT (slug) DO NOTHING;
-- 'the-health-factory' already exists.

-- Criteria, per variant category.
WITH c AS (SELECT id, slug FROM public.categories WHERE slug IN ('bread-multigrain','bread-protein'))
INSERT INTO public.category_rules
  (category_id, code, description, evaluator_kind, threshold_value, threshold_unit, is_required, display_order, active)
SELECT c.id, v.code, v.description, v.kind, v.tv, v.tu, true, v.ord, true
FROM c, (VALUES
  ('bread-multigrain','bread_mg_no_colour','No added colour','manual',NULL::numeric,NULL::text,10),
  ('bread-multigrain','bread_mg_no_maida','No maida — only whole wheat flour','manual',NULL,NULL,20),
  ('bread-multigrain','bread_mg_no_preservatives','No preservatives','manual',NULL,NULL,30),
  ('bread-multigrain','bread_mg_fibre_gte_6','At least 6g dietary fibre per 100g','threshold_gte',6,'g_per_100g',40),
  ('bread-protein','bread_pr_no_colour','No added colour','manual',NULL,NULL,10),
  ('bread-protein','bread_pr_no_maida','No maida — only whole wheat flour','manual',NULL,NULL,20),
  ('bread-protein','bread_pr_no_preservatives','No preservatives','manual',NULL,NULL,30),
  ('bread-protein','bread_pr_protein_gte_15','At least 15g protein per 100g','threshold_gte',15,'g_per_100g',40)
) AS v(cat_slug, code, description, kind, tv, tu, ord)
WHERE c.slug = v.cat_slug;

-- Products (Draft). nutrition is JSONB per-100g; NULL where no panel is published.
WITH b AS (SELECT id, slug FROM public.brands WHERE slug IN
  ('the-health-factory','bakers-loaf','the-bakers-dozen','protein-chef')),
cat AS (SELECT id, slug FROM public.categories WHERE slug IN ('bread-multigrain','bread-protein'))
INSERT INTO public.products
  (slug, name, brand_id, category_id, variant_size, status, certification_method,
   product_photo_url, ingredients_raw, nutrition, primary_buy_url, last_verified_at)
SELECT v.slug, v.name, b.id, cat.id, v.variant_size,
       'Draft'::public.product_status, 'label_tested'::public.certification_method,
       v.photo, v.ingredients, v.nutrition::jsonb, v.buy_url, '2026-05-24T00:00:00+00:00'
FROM b, cat,
     (VALUES
       ('the-health-factory-zero-maida-multigrain-bread', 'Zero Maida Super Multigrain Bread',
        'the-health-factory', 'bread-multigrain', '250g',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/the-health-factory-zero-maida-multigrain-bread.png',
        'Chakki Fresh Atta (Whole Wheat Flour), Multigrain Mix (20%) (Rolled Oats, Barley Flakes, Flax Seeds, Sunflower Seeds, White Sesame Seeds, Soya Bean Seed Grits, Watermelon Seeds), Yeast, Wheat Gluten, Rice Bran Oil (Edible Vegetable Oil), Cane Sugar, Iodised Salt, Cultured Wheat Flour, Cultured Glucose.',
        '{"per":"100g","source":"https://www.bigbasket.com/pd/40291988/the-health-factory-zero-maida-bread-simply-multi-grain-no-chemical-preservatives-low-sugar-fat-250-g/","rows":[{"label":"Energy","value":238.17,"unit":"kcal","bold":true},{"label":"Protein","value":12.91,"unit":"g","bold":true},{"label":"Carbohydrate","value":43.19,"unit":"g","bold":true},{"label":"Total Sugars","value":4.41,"unit":"g","indent":true},{"label":"Added Sugars","value":2.15,"unit":"g","indent":true},{"label":"Dietary Fibre","value":7.37,"unit":"g","indent":true},{"label":"Total Fat","value":1.53,"unit":"g","bold":true},{"label":"Saturated Fat","value":0.22,"unit":"g","indent":true},{"label":"Trans Fat","value":0,"unit":"g","indent":true},{"label":"Cholesterol","value":0,"unit":"mg"},{"label":"Sodium","value":365.91,"unit":"mg"}]}',
        'https://www.bigbasket.com/pd/40291988/the-health-factory-zero-maida-bread-simply-multi-grain-no-chemical-preservatives-low-sugar-fat-250-g/'),
       ('bakers-loaf-multigrain-bread', 'Baker''s Loaf Multigrain Bread',
        'modern', 'bread-multigrain', '350g',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/bakers-loaf-multigrain-bread.jpg',
        'Whole Wheat Flour (Atta) (48.15%), Grains & Seeds (15.2%) [Rolled Oats (3.5%), Flax Seeds (2.31%), Maize Flour (1.44%), Rice Flour (1.20%), Barley Flour (1.20%), Bajra Flour (0.96%), Ragi Flour (0.96%), Jowar Flour (0.96%), Sesame Seeds (0.96%), Soya Flour (0.49%), Sunflower Seeds (0.36%), White Watermelon Seeds (0.36%)], Bengal Gram Flour (0.24%), Yeast, Sugar, Gluten, Edible Vegetable Oil (Refined Soyabean Oil), Iodised Salt, Fermented Wheat Flour, Brewed Vinegar, Malt Products, Cultured Sugar, Wheat Bran.',
        '{"per":"100g","source":"https://www.zepto.com/pn/bakers-loaf-zero-preservatives-multigrain-bread/pvid/50ce2591-795f-4eaa-bfc7-62f7c0e758ba","rows":[{"label":"Energy","value":234.95,"unit":"kcal","bold":true},{"label":"Protein","value":6.63,"unit":"g","bold":true},{"label":"Carbohydrate","value":47.80,"unit":"g","bold":true},{"label":"Total Sugars","value":5.25,"unit":"g","indent":true},{"label":"Added Sugars","value":1.57,"unit":"g","indent":true},{"label":"Dietary Fibre","value":1.51,"unit":"g","indent":true},{"label":"Total Fat","value":1.35,"unit":"g","bold":true},{"label":"Saturated Fat","value":0.52,"unit":"g","indent":true},{"label":"Trans Fat","value":0,"unit":"g","indent":true},{"label":"Cholesterol","value":0,"unit":"mg"},{"label":"Sodium","value":351.31,"unit":"mg"}]}',
        'https://www.zepto.com/pn/bakers-loaf-zero-preservatives-multigrain-bread/pvid/50ce2591-795f-4eaa-bfc7-62f7c0e758ba'),
       ('the-bakers-dozen-multigrain-bread', 'Multigrain Loaf',
        'the-bakers-dozen', 'bread-multigrain', '375g',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/the-bakers-dozen-multigrain-bread.jpg',
        'Wholewheat Flour (42%), Seeds (Flax, Sunflower, Sesame) (5.3%), Sunflower Oil, Oats (3%), Sugar, Sourdough (2%), Brown Rice Flour (1%), Jowar Flour (1%), Yeast, Iodized Salt, Gluten, Fermented Wheat Flour, Flour Treatment Agent (INS 1100 (i)).',
        '{"per":"100g","source":"https://www.zepto.com/pn/the-bakers-dozen-zero-maida-multigrain-bread-whole-wheatnot-brown-superseed-breadatta-bread/pvid/b4c8bfce-3f1c-4393-afe1-fc619123b068","rows":[{"label":"Energy","value":344,"unit":"kcal","bold":true},{"label":"Protein","value":11,"unit":"g","bold":true},{"label":"Carbohydrate","value":66,"unit":"g","bold":true},{"label":"Total Sugars","value":5,"unit":"g","indent":true},{"label":"Added Sugars","value":2,"unit":"g","indent":true},{"label":"Dietary Fibre","value":7,"unit":"g","indent":true},{"label":"Total Fat","value":4,"unit":"g","bold":true},{"label":"Saturated Fat","value":0.4,"unit":"g","indent":true},{"label":"Trans Fat","value":0,"unit":"g","indent":true},{"label":"Cholesterol","value":0,"unit":"mg"},{"label":"Sodium","value":250,"unit":"mg"}]}',
        'https://www.zepto.com/pn/the-bakers-dozen-zero-maida-multigrain-bread-whole-wheatnot-brown-superseed-breadatta-bread/pvid/b4c8bfce-3f1c-4393-afe1-fc619123b068'),
       ('protein-chef-protein-multigrain-bread', 'Protein Multigrain Bread',
        'protein-chef', 'bread-protein', '270g',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/protein-chef-protein-multigrain-bread.jpg',
        'Atta (Whole Wheat Flour), Protein Premix [Soya Flour (4.3%), Defatted Peanut Flour (0.3%)], Vital Wheat Gluten, Refined Sunflower Oil, Mixed Seeds & Grains [Flax Seeds (0.7%), Oats (0.4%), Sesame Seeds (0.4%)], Yeast, Sugar, Iodized Salt, Bread Premix (Fermented Wheat Flour, Fermented Glucose), Vinegar, Bread Improver (Maize Starch).',
        '{"per":"100g","source":"https://www.zepto.com/pn/protein-chef-42g-protein-multigrain-bread-5-superfoods-wheat/pvid/bab4f67c-7c3a-4621-b3ac-e00df6314eca","rows":[{"label":"Energy","value":245,"unit":"kcal","bold":true},{"label":"Protein","value":15.6,"unit":"g","bold":true},{"label":"Carbohydrate","value":46.4,"unit":"g","bold":true},{"label":"Total Sugars","value":3.8,"unit":"g","indent":true},{"label":"Added Sugars","value":0.6,"unit":"g","indent":true},{"label":"Dietary Fibre","value":8.6,"unit":"g","indent":true},{"label":"Total Fat","value":1.6,"unit":"g","bold":true},{"label":"Saturated Fat","value":0.2,"unit":"g","indent":true},{"label":"Trans Fat","value":0,"unit":"g","indent":true},{"label":"Cholesterol","value":0,"unit":"mg"},{"label":"Sodium","value":450,"unit":"mg"}]}',
        'https://www.zepto.com/pn/protein-chef-42g-protein-multigrain-bread-5-superfoods-wheat/pvid/bab4f67c-7c3a-4621-b3ac-e00df6314eca'),
       ('the-health-factory-zero-maida-protein-bread', 'Zero Maida Protein Bread',
        'the-health-factory', 'bread-protein', '250g',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/the-health-factory-zero-maida-protein-bread.jpg',
        'Chakki Fresh Atta (Whole Wheat Flour), Protein Blend (Soya Protein Isolate, Pea Protein Isolate, Milk Solids, Whey Protein Concentrate), Wheat Gluten, Yeast, Rice Bran Oil (Edible Vegetable Oil), Cane Sugar, Iodised Salt, Cultured Wheat Flour, Cultured Glucose.',
        '{"per":"100g","source":"https://www.zepto.com/pn/the-health-factory-zero-maida-protein-bread-clean-label-not-brown/pvid/c0bf40ad-fdb9-4d88-89b2-c8d690e024c3","rows":[{"label":"Energy","value":241.99,"unit":"kcal","bold":true},{"label":"Protein","value":15.24,"unit":"g","bold":true},{"label":"Carbohydrate","value":41.50,"unit":"g","bold":true},{"label":"Total Sugars","value":3.34,"unit":"g","indent":true},{"label":"Added Sugars","value":1.79,"unit":"g","indent":true},{"label":"Dietary Fibre","value":4.87,"unit":"g","indent":true},{"label":"Total Fat","value":1.67,"unit":"g","bold":true},{"label":"Saturated Fat","value":0.21,"unit":"g","indent":true},{"label":"Trans Fat","value":0,"unit":"g","indent":true},{"label":"Cholesterol","value":0,"unit":"mg"}]}',
        'https://www.zepto.com/pn/the-health-factory-zero-maida-protein-bread-clean-label-not-brown/pvid/c0bf40ad-fdb9-4d88-89b2-c8d690e024c3'),
       ('the-bakers-dozen-protein-bread', 'Zero Maida Protein Bread',
        'the-bakers-dozen', 'bread-protein', '240g',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/the-bakers-dozen-protein-bread.png',
        'Whole Wheat Flour (Atta) (52%), Soy Protein Isolate (5%), Sourdough (3%), Yeast, Vinegar, Sunflower Oil, Sugar, Fermented Wheat Flour, Iodized Salt, Gluten, Flour Treatment Agent (INS 1100 (I)).',
        '{"per":"100g","source":"https://www.swiggy.com/instamart/p/the-baker-s-dozen-zero-maida-protein-bread-GNNU1YF1H8","rows":[{"label":"Energy","value":272,"unit":"kcal","bold":true},{"label":"Protein","value":17,"unit":"g","bold":true},{"label":"Carbohydrate","value":44,"unit":"g","bold":true},{"label":"Total Sugars","value":4,"unit":"g","indent":true},{"label":"Added Sugars","value":2,"unit":"g","indent":true},{"label":"Dietary Fibre","value":4,"unit":"g","indent":true},{"label":"Total Fat","value":3,"unit":"g","bold":true},{"label":"Saturated Fat","value":1,"unit":"g","indent":true},{"label":"Trans Fat","value":0,"unit":"g","indent":true},{"label":"Cholesterol","value":0,"unit":"mg"},{"label":"Sodium","value":196,"unit":"mg"}]}',
        'https://www.swiggy.com/instamart/p/the-baker-s-dozen-zero-maida-protein-bread-GNNU1YF1H8')
     ) AS v(slug, name, brand_slug, cat_slug, variant_size, photo, ingredients, nutrition, buy_url)
WHERE b.slug = v.brand_slug AND cat.slug = v.cat_slug
ON CONFLICT (slug) DO NOTHING;

COMMIT;
