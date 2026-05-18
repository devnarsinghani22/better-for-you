BEGIN;

-- Country Delight: real BigBasket URL, 100g pack, photos
UPDATE public.products SET
  primary_buy_url = 'https://www.bigbasket.com/pd/40367435/country-delight-50g-protein-natural-greek-yoghurt-100-g/',
  variant_size = '100g',
  product_photo_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/country-delight-protein-greek-yogurt.jpg',
  label_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/country-delight-protein-greek-yogurt-label.jpg',
  last_verified_at = now()
WHERE slug = 'country-delight-protein-greek-yogurt';

-- Epigamia: BigBasket URL, 460g pack, photos
UPDATE public.products SET
  primary_buy_url = 'https://www.bigbasket.com/pd/40329278/epigamia-turbo-50-g-protein-yogurt-natural-460-g/',
  variant_size = '460g',
  product_photo_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/epigamia-turbo-protein-yogurt.jpg',
  label_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/epigamia-turbo-protein-yogurt-label.jpg',
  last_verified_at = now()
WHERE slug = 'epigamia-turbo-protein-yogurt';

-- Milky Mist Skyr: keep existing buy URL (100g cup), add photos
UPDATE public.products SET
  product_photo_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/milky-mist-skyr-high-protein-plain.jpg',
  label_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/products/milky-mist-skyr-high-protein-plain-label.jpg',
  last_verified_at = now()
WHERE slug = 'milky-mist-skyr-high-protein-plain';

COMMIT;
SELECT slug, name, variant_size, primary_buy_url, product_photo_url IS NOT NULL AS has_photo, label_image_url IS NOT NULL AS has_label
FROM public.products
WHERE category_id = (SELECT id FROM public.categories WHERE slug='yogurt');
