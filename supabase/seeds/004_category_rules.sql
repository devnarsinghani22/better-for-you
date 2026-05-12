-- ===== Universal rules (category_id IS NULL) — apply to every product =====
INSERT INTO public.category_rules (category_id, code, description, evaluator_kind, is_required, display_order) VALUES
  (NULL, 'no_maida',                'No maida (refined wheat flour).',                'boolean', true, 10),
  (NULL, 'no_palm_oil',             'No palm oil.',                                    'boolean', true, 20),
  (NULL, 'no_artificial_colors',    'No artificial colours.',                          'boolean', true, 30),
  (NULL, 'no_artificial_flavours',  'No artificial flavours.',                         'boolean', true, 40),
  (NULL, 'no_artificial_sweeteners','No artificial sweeteners.',                       'boolean', true, 50),
  (NULL, 'no_thickeners',           'No thickeners or emulsifiers.',                   'boolean', true, 60),
  (NULL, 'no_maltodextrin',         'No maltodextrin.',                                'boolean', true, 70),
  (NULL, 'sugar_max_universal',     'Added sugar capped (per category threshold).',    'manual',  true, 80);

-- ===== Per-category rules =====
DO $$
DECLARE
  c_rusks INT; c_biscuits INT; c_noodles INT; c_paneer INT; c_pb INT;
BEGIN
  SELECT id INTO c_rusks    FROM public.categories WHERE slug = 'rusks';
  SELECT id INTO c_biscuits FROM public.categories WHERE slug = 'biscuits';
  SELECT id INTO c_noodles  FROM public.categories WHERE slug = 'noodles';
  SELECT id INTO c_paneer   FROM public.categories WHERE slug = 'paneer';
  SELECT id INTO c_pb       FROM public.categories WHERE slug = 'peanut-butter';

  -- Rusks: wholegrains (no maida — covered by universal), no artificial colours (universal),
  -- <15g added sugar/100g, ≥10g protein/100g (fibre rule deactivated post-launch)
  INSERT INTO public.category_rules (category_id, code, description, evaluator_kind, threshold_value, threshold_unit, display_order) VALUES
    (c_rusks, 'wholegrain_only',       'Only wholegrain flour (no maida).',         'boolean',       NULL, NULL,         10),
    (c_rusks, 'sugar_lt_15_per_100g',  'Less than 15g added sugar per 100g.',       'threshold_lt',  15,   'g_per_100g', 20),
    (c_rusks, 'protein_gte_10_per_100g','At least 10g protein per 100g.',           'threshold_gte', 10,   'g_per_100g', 40);

  -- Biscuits: wholegrains, no artificial colours, <20g added sugar/100g, ≥5g fibre/100g
  INSERT INTO public.category_rules (category_id, code, description, evaluator_kind, threshold_value, threshold_unit, display_order) VALUES
    (c_biscuits, 'wholegrain_only',       'Only wholegrain flour (wheat or millets — no maida).', 'boolean',       NULL, NULL,         10),
    (c_biscuits, 'sugar_lt_20_per_100g',  'Less than 20g added sugar per 100g.',                  'threshold_lt',  20,   'g_per_100g', 20),
    (c_biscuits, 'fibre_gte_5_per_100g',  'At least 5g dietary fibre per 100g.',                  'threshold_gte', 5,    'g_per_100g', 30);

  -- Noodles: only wholegrain flour + salt + oil; spice mix only powdered spices/herbs/salt; sodium <100mg/100g
  INSERT INTO public.category_rules (category_id, code, description, evaluator_kind, threshold_value, threshold_unit, display_order) VALUES
    (c_noodles, 'noodle_simple_ingredients',     'Noodles contain only wholegrain flour, salt, and/or oil.', 'manual',       NULL, NULL,          10),
    (c_noodles, 'spice_mix_simple',              'Spice mix only powdered spices, herbs, and salt.',         'manual',       NULL, NULL,          20),
    (c_noodles, 'sodium_lt_100_per_100g',        'Sodium less than 100mg per 100g.',                         'threshold_lt', 100,  'mg_per_100g', 30);

  -- Paneer: only milk + acidic agent
  INSERT INTO public.category_rules (category_id, code, description, evaluator_kind, threshold_value, threshold_unit, display_order) VALUES
    (c_paneer, 'paneer_pure_ingredients', 'Only milk (or milk solids) and an acidic agent — lime, citric acid, or vinegar.', 'manual', NULL, NULL, 10);

  -- Peanut Butter: 100% peanuts (or peanuts + whey), no sugar/salt/oil, ≥25g protein/100g
  INSERT INTO public.category_rules (category_id, code, description, evaluator_kind, threshold_value, threshold_unit, display_order) VALUES
    (c_pb, 'pb_pure_ingredients',     '100% peanuts (or peanuts + whey).',           'manual',        NULL, NULL,         10),
    (c_pb, 'pb_no_sugar_salt_oil',    'No added sugar, salt, or oil.',               'boolean',       NULL, NULL,         20),
    (c_pb, 'pb_protein_gte_25_per_100g','At least 25g protein per 100g.',            'threshold_gte', 25,   'g_per_100g', 30);
END $$;
