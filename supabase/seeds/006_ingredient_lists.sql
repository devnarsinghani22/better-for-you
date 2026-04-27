-- Verbatim ingredient lists pulled from brand sites + Open Food Facts
UPDATE public.products SET ingredients_raw = 'Chakki Fresh Atta, Sooji, Cane Sugar, Rice Bran Oil, Yeast, Wheat Gluten, Cinnamon, Iodised Salt, Rosemary Extract, Cultured Glucose' WHERE slug = 'zero-maida-rusk';
UPDATE public.products SET ingredients_raw = 'Whole wheat flour 40%, Whole multigrain millet flour 20% (Little millet 5%, Sorghum/Jowar 5%, Kodo millet 5%, Bajra 5%), Wood-pressed Groundnut oil 15%, Sulphurless Traditional Mishri/Kallusakkare 11%, Dry fruits & seeds 6% (Sunflower Seeds 2%, Cashew 2%, Almonds 2%), Jaggery 4%, Yeast 2%, Rock Salt 1%, Ajwain/Carom Seeds 0.5%, Cardamom 0.49%, Turmeric 0.01% and nothing else' WHERE slug = 'millet-rusk';
UPDATE public.products SET ingredients_raw = 'Whole Multigrain Flour 36% (Little Millet/Saame 11%, Kodo Millet 7%, Jowar/Sorghum 6%, Ragi/Finger Millet 5%, Bajra/Pearl Millet 5%, Foxtail Millet 2%), Butter 17% Jaggery 15%, Powdered Dry Fruits & Seeds 15% (Sunflower Seeds 5%, Dates 4%, Almonds 3%, Cashew 3%), Barley 6%, Un-Polished Red Rice 6%, Ghee 2%, Yellow Moong Dal 2%, Cinnamon 0.98%, Turmeric 0.02% and nothing else.' WHERE slug = 'millet-jaggery-cookies';
UPDATE public.products SET ingredients_raw = 'Wholegrain Flour Blend (43%) (Jowar Flour, Whole Wheat Flour), Jaggery, Choco Chips, Butter Milk, Coconut Oil, Butter, Coco Powder, Milk, Raising Agents (INS 500(II)), Baking Powder' WHERE slug = 'millet-chocolate-chip';
UPDATE public.products SET ingredients_raw = 'Wheat, Groundnut Oil, Salt.' WHERE slug = 'wheat-noodles-little-moppet';
UPDATE public.products SET ingredients_raw = 'Noodles: Traditional Whole wheat flour (70%), Quinoa Flour (30%), Salt and Water. Tastemaker: Pepper (45%), Spice Mix (Coriander, Cumin, Fenugreek, Chillipeppers & Spices) (45%), Chilli powder (5%), Turmeric powder (5%), salt.' WHERE slug = 'quinoa-noodles-naturally';
UPDATE public.products SET ingredients_raw = 'Roasted Peanuts, Salt, Sugar, Permitted Stabilizing Agent (INS 471)' WHERE slug = 'myfitness-crunchy-pb';
UPDATE public.products SET ingredients_raw = 'Peanuts, Jaggery, Himalayan Pink Salt' WHERE slug = 'nut-roasters-crunchy-pb';
UPDATE public.products SET ingredients_raw = 'Milk solids, Citric acid, Common salt.' WHERE slug = 'amul-fresh-paneer';
UPDATE public.products SET ingredients_raw = 'Milk solids, citric acid' WHERE slug = 'amul-malai-paneer';
UPDATE public.products SET ingredients_raw = 'Cow''s Milk, Vinegar' WHERE slug = 'gowardhan-paneer';
UPDATE public.products SET ingredients_raw = 'Milk, Milk Solids, Citric Acid' WHERE slug = 'desi-farms-low-fat-paneer';
UPDATE public.products SET ingredients_raw = 'Milk, lemon concentrate.' WHERE slug = 'id-fresh-high-protein-paneer';
-- Note: humpy-a2-paneer and milky-mist-high-protein-paneer left null (brand sites had no published ingredient list at retrieval time)
