-- 2026-05-18: Yogurt category — 3 high-protein products from the team sheet.
-- Hero image URL is NULL for now; needs to be uploaded separately.
-- Product photos + nutrition labels also pending.
-- Applied directly to cloud DB via PostgREST; this file is the record.

BEGIN;

INSERT INTO public.categories (slug, name, blurb, serving_size_g, serving_label, display_order, active)
VALUES ('yogurt', 'Yogurt',
        'High-protein yogurt with no added sugar. At least 10g protein per 100g.',
        100, 'per 100g', 100, true)
ON CONFLICT (slug) DO NOTHING;

WITH c AS (SELECT id FROM public.categories WHERE slug = 'yogurt')
INSERT INTO public.category_rules (category_id, code, description, evaluator_kind, threshold_value, threshold_unit, is_required, display_order)
SELECT c.id, v.code, v.description, v.kind, v.tv, v.tu, true, v.ord
FROM c, (VALUES
  ('protein_min_10g', 'At least 10g protein per 100g', 'threshold_gte', 10::numeric, 'g', 10),
  ('yogurt_no_added_sugar', 'No added sugar', 'boolean', NULL::numeric, NULL::text, 20),
  ('yogurt_no_artificial_flavours', 'No artificial flavours', 'boolean', NULL::numeric, NULL::text, 30)
) AS v(code, description, kind, tv, tu, ord)
ON CONFLICT DO NOTHING;

INSERT INTO public.brands (slug, name, website_url)
VALUES ('epigamia', 'Epigamia', 'https://epigamia.com/')
ON CONFLICT (slug) DO NOTHING;

WITH cat AS (SELECT id FROM public.categories WHERE slug='yogurt'),
     b AS (SELECT id, slug FROM public.brands WHERE slug IN ('milky-mist','epigamia','country-delight'))
INSERT INTO public.products
  (slug, name, brand_id, category_id, variant_size, status, certification_method, ingredients_raw, primary_buy_url, last_verified_at)
SELECT v.slug, v.name, b.id, cat.id, v.variant_size, 'Live'::public.product_status, 'label_tested'::public.certification_method, v.ingredients, v.url, now()
FROM cat, b, (VALUES
  ('milky-mist-skyr-high-protein-plain', 'Skyr High Protein Plain', 'milky-mist', '100g',
    'Pasteurized Skimmed Milk, Milk Solids, Active Lactic Culture, Probiotic Culture',
    'https://www.bigbasket.com/pd/40276320/milky-mist-skyr-plain-yogurt-high-in-protein-low-fat-100-g/'),
  ('epigamia-turbo-protein-yogurt', 'Turbo Protein Yogurt', 'epigamia', '90g',
    'Skimmed Milk, Pectin, Permitted Lactic Acid Culture',
    'https://epigamia.com/'),
  ('country-delight-protein-greek-yogurt', 'Protein Natural Greek Yogurt', 'country-delight', '400g',
    'Pasteurized Milk, Enzyme (β-Galacosidase), Active Lactic Culture',
    'https://countrydelight.in/products/dairy/protein-natural-greek-yogurt')
) AS v(slug, name, brand_slug, variant_size, ingredients, url)
WHERE b.slug = v.brand_slug
ON CONFLICT (slug) DO NOTHING;

COMMIT;

SELECT p.slug, p.name, b.name AS brand, p.variant_size FROM products p JOIN brands b ON p.brand_id=b.id WHERE p.category_id=(SELECT id FROM categories WHERE slug='yogurt');
