-- Replace 4 problem images
UPDATE public.products SET product_photo_url = 'https://www.amul.com/files/products/Fresh-Paneer_yellow_bg.jpg' WHERE slug = 'amul-fresh-paneer';
UPDATE public.products SET product_photo_url = 'https://www.amul.com/files/products/Malai-Paneer.jpg' WHERE slug = 'amul-malai-paneer';
UPDATE public.products SET product_photo_url = 'https://images.openfoodfacts.org/images/products/890/408/550/0106/front_en.3.400.jpg' WHERE slug = 'milky-mist-high-protein-paneer';
UPDATE public.products SET product_photo_url = 'https://shopcdn.mylittlemoppet.com/wp-content/uploads/2017/03/98-Wheat-Noodles-13cm-X-16-cm-Product-Pic_1.jpg' WHERE slug = 'wheat-noodles-little-moppet';

-- Drop em dashes + simplify category blurbs
UPDATE public.categories SET blurb = 'Wholegrain rusks, no maida, no artificial colors.' WHERE slug = 'rusks';
UPDATE public.categories SET blurb = 'Made from wholegrains. Low in sugar. Higher in fibre than the usual cookie.' WHERE slug = 'biscuits';
UPDATE public.categories SET blurb = 'Cleaner spice mixes and lower sodium than mainstream packs.' WHERE slug = 'noodles';
UPDATE public.categories SET blurb = 'Real milk paneer. Tested by a lab. No starches or thickeners.' WHERE slug = 'paneer';
UPDATE public.categories SET blurb = '100% peanuts, or peanuts plus whey. Nothing else added.' WHERE slug = 'peanut-butter';

-- Drop em dashes from category_rules descriptions
UPDATE public.category_rules SET description = 'Only milk (or milk solids) and an acidic agent like lime, citric acid, or vinegar.' WHERE code = 'paneer_pure_ingredients';
UPDATE public.category_rules SET description = 'Only wholegrain flour, salt, and oil. No maida.' WHERE code = 'noodle_simple_ingredients';
UPDATE public.category_rules SET description = 'Only powdered spices, herbs, and salt in the spice mix.' WHERE code = 'spice_mix_simple';
UPDATE public.category_rules SET description = '100 per cent peanuts. Or peanuts plus whey.' WHERE code = 'pb_pure_ingredients';
UPDATE public.category_rules SET description = 'Only wholegrain flour. No maida.' WHERE code = 'wholegrain_only';
