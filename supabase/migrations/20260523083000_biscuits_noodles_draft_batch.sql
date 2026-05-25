-- 2026-05-23: Stage 4 new products as Draft for review on staging URL.
-- Applied via PostgREST; this file is the record. Status = 'Draft' so they
-- appear on staging (env-aware visibility helper) but stay hidden on prod
-- until promoted to 'Live'.
--
-- Biscuits (category_id = 2):
--   • Open Secret Healthy Digestive Biscuit (100g)
--   • Nourish Organics Almond Buckwheat Cookies (125g)
-- Noodles  (category_id = 3):
--   • Conscious Food Millet Noodles (180g)
--   • Yu Foodlabs Whole Wheat Noodles (150g)
--
-- Slurrp Farm biscuit dropped per user (wrong SKU + fails added-sugar criterion).
-- 3 noodles (Conscious Food, Slurrp Farm Little Millet, WickedGud Hakka) pending —
-- Amazon-only listings, brand sites returned 0 bytes.

BEGIN;

INSERT INTO public.brands (slug, name, website_url) VALUES
  ('open-secret',      'Open Secret',      'https://opensecret.in/'),
  ('nourish-organics', 'Nourish Organics', 'https://nourishorganics.in/'),
  ('conscious-food',   'Conscious Food',   'https://www.consciousfood.com/'),
  ('yu-foodlabs',      'Yu Foodlabs',      'https://www.letsyu.com/')
ON CONFLICT (slug) DO NOTHING;

WITH b AS (SELECT id, slug FROM public.brands WHERE slug IN
  ('open-secret','nourish-organics','conscious-food','yu-foodlabs'))
INSERT INTO public.products
  (slug, name, brand_id, category_id, variant_size, status, certification_method,
   rating, product_photo_url, label_image_url, ingredients_raw, primary_buy_url,
   last_verified_at)
SELECT v.slug, v.name, b.id, v.category_id, v.variant_size,
       'Draft'::public.product_status, 'label_tested'::public.certification_method,
       'A', v.photo, v.label, v.ingredients, v.buy_url, now()
FROM b,
     (VALUES
       ('open-secret-healthy-digestive', 'Healthy Digestive Biscuit', 'open-secret', 2, '100g',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/open-secret-healthy-digestive.jpg',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/labels/open-secret-healthy-digestive.jpg',
        'Verbatim ingredients pending — see label image for full list.',
        'https://opensecret.in/products/open-secret-healthy-digestive-biscuit-0-maida-0-palm-oil-high-fibre-goodness-of-atta-guilt-free-100g'),
       ('nourish-organics-almond-buckwheat', 'Almond Buckwheat Cookies', 'nourish-organics', 2, '125g',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/nourish-organics-almond-buckwheat.jpg',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/labels/nourish-organics-almond-buckwheat.jpg',
        'Buckwheat (20%), Organic Sunflower Seeds (18%), Organic Raisin (12%), Coconut Powder (10%), Organic Honey (10%), Organic Almonds (8%), Dehydrated Apples (5%), Organic Brown Sugar (5%), Rice Bran Oil (5%), Raising Agent [INS 500(ii)], Cinnamon, Vanilla Powder.',
        'https://www.bigbasket.com/pd/900448366/nourish-organics-almond-buckwheat-cookies-rich-in-fibre-protein-gluten-free-125-g/'),
       ('conscious-food-millet-noodles', 'Millet Noodles', 'conscious-food', 3, '180g',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/conscious-food-millet-noodles.jpg',
        NULL,
        'Millet Noodles: Jowar millet flour, Whole wheat flour, Cluster bean (Guar Phalee) powder, Salt. Spice Mix: Coriander seeds, Red chillies, Onion powder, Turmeric powder, Garlic powder, Ginger powder, Fennel seeds, Aniseed, Cardamom, Nutmeg, Cassia, Star anise, Dry mango powder, Black pepper, Unrefined cane sugar, Common salt, Black salt, White corn flour.',
        'https://www.consciousfood.com/products/millet-noodles'),
       ('yu-foodlabs-whole-wheat-noodles', 'Whole Wheat Noodles', 'yu-foodlabs', 3, '150g',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/yu-foodlabs-whole-wheat-noodles.jpg',
        'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/labels/yu-foodlabs-whole-wheat-noodles.jpg',
        'Whole Wheat Noodles: Whole Wheat Flour and Water. Chowmein Sauce: Soya Sauce, Sesame Oil, White Pepper, Salt, Garlic, Ginger, Red Chilli Powder, Vinegar, Sugar. Allergens: Wheat (Gluten), Soya, Sesame.',
        'https://www.bigbasket.com/pd/900457281/yu-whole-wheat-noodles-150-g/')
     ) AS v(slug, name, brand_slug, category_id, variant_size, photo, label, ingredients, buy_url)
WHERE b.slug = v.brand_slug
ON CONFLICT (slug) DO NOTHING;

COMMIT;
