-- Brands
INSERT INTO public.brands (slug, name) VALUES
  ('the-health-factory',  'The Health Factory'),
  ('early-foods',         'Early Foods'),
  ('kikibix',             'Kikibix'),
  ('little-moppet-foods', 'Little Moppet Foods'),
  ('naturally-yours',     'Naturally Yours'),
  ('myfitness',           'Myfitness'),
  ('nut-roasters',        'Nut Roasters'),
  ('amul',                'Amul'),
  ('gowardhan',           'Gowardhan'),
  ('humpy',               'Humpy A2'),
  ('desi-farms',          'Desi Farms'),
  ('id-fresh',            'ID Fresh'),
  ('milky-mist',          'Milky Mist')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.brands (slug, name, is_excluded, exclusion_reason)
VALUES ('pintola', 'Pintola', false,
        'Pending verification: does Pintola produce whey/protein? If yes, exclude per OWN-competitor policy.')
ON CONFLICT (slug) DO NOTHING;

-- Products
DO $$
DECLARE
  c_rusks INT;
  c_biscuits INT;
  c_noodles INT;
  c_paneer INT;
  c_pb INT;
BEGIN
  SELECT id INTO c_rusks    FROM public.categories WHERE slug = 'rusks';
  SELECT id INTO c_biscuits FROM public.categories WHERE slug = 'biscuits';
  SELECT id INTO c_noodles  FROM public.categories WHERE slug = 'noodles';
  SELECT id INTO c_paneer   FROM public.categories WHERE slug = 'paneer';
  SELECT id INTO c_pb       FROM public.categories WHERE slug = 'peanut-butter';

  -- Rusks
  INSERT INTO public.products (slug, name, brand_id, category_id, status, certification_method, rating, last_verified_at) VALUES
    ('zero-maida-rusk',  'Zero Maida Rusk', (SELECT id FROM public.brands WHERE slug='the-health-factory'), c_rusks, 'Live', 'label_tested', 'A',  now()),
    ('millet-rusk',      'Millet Rusk',     (SELECT id FROM public.brands WHERE slug='early-foods'),         c_rusks, 'Live', 'label_tested', 'A',  now())
  ON CONFLICT (slug) DO NOTHING;

  -- Biscuits
  INSERT INTO public.products (slug, name, brand_id, category_id, status, certification_method, rating, last_verified_at) VALUES
    ('millet-jaggery-cookies',  'Millet Jaggery Cookies',  (SELECT id FROM public.brands WHERE slug='early-foods'), c_biscuits, 'Live', 'label_tested', 'A', now()),
    ('millet-chocolate-chip',   'Millet Chocolate Chip',   (SELECT id FROM public.brands WHERE slug='kikibix'),     c_biscuits, 'Live', 'label_tested', 'A', now())
  ON CONFLICT (slug) DO NOTHING;

  -- Noodles
  INSERT INTO public.products (slug, name, brand_id, category_id, status, certification_method, rating, last_verified_at) VALUES
    ('wheat-noodles-little-moppet', 'Wheat Noodles',  (SELECT id FROM public.brands WHERE slug='little-moppet-foods'), c_noodles, 'Live', 'label_tested', 'A', now()),
    ('quinoa-noodles-naturally',    'Quinoa Noodles', (SELECT id FROM public.brands WHERE slug='naturally-yours'),     c_noodles, 'Live', 'label_tested', 'A', now())
  ON CONFLICT (slug) DO NOTHING;

  -- Peanut Butter
  INSERT INTO public.products (slug, name, brand_id, category_id, status, certification_method, rating, last_verified_at) VALUES
    ('pintola-crunchy-pb',           'Peanut Butter Crunchy',         (SELECT id FROM public.brands WHERE slug='pintola'),     c_pb, 'Draft', 'label_tested', 'A',  now()),
    ('myfitness-crunchy-pb',         'Peanut Butter Crunchy',         (SELECT id FROM public.brands WHERE slug='myfitness'),   c_pb, 'Live',  'label_tested', 'A',  now()),
    ('pintola-high-protein-pb',      'High Protein Peanut Butter',    (SELECT id FROM public.brands WHERE slug='pintola'),     c_pb, 'Draft', 'label_tested', 'A+', now()),
    ('nut-roasters-crunchy-pb',      'Crunchy Peanut Butter',         (SELECT id FROM public.brands WHERE slug='nut-roasters'),c_pb, 'Live',  'label_tested', 'A+', now())
  ON CONFLICT (slug) DO NOTHING;

  -- Paneer (lab-tested)
  INSERT INTO public.products (slug, name, brand_id, category_id, status, certification_method, rating, last_verified_at) VALUES
    ('amul-fresh-paneer',             'Fresh Paneer',         (SELECT id FROM public.brands WHERE slug='amul'),       c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('amul-malai-paneer',             'Malai Fresh Paneer',   (SELECT id FROM public.brands WHERE slug='amul'),       c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('gowardhan-paneer',              'Paneer',               (SELECT id FROM public.brands WHERE slug='gowardhan'),  c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('humpy-a2-paneer',               'A2 Paneer',            (SELECT id FROM public.brands WHERE slug='humpy'),      c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('desi-farms-low-fat-paneer',     'Low Fat Paneer',       (SELECT id FROM public.brands WHERE slug='desi-farms'), c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('id-fresh-high-protein-paneer',  'High Protein Paneer',  (SELECT id FROM public.brands WHERE slug='id-fresh'),   c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('milky-mist-high-protein-paneer','High Protein Paneer',  (SELECT id FROM public.brands WHERE slug='milky-mist'), c_paneer, 'Live', 'lab_tested', 'A+', now())
  ON CONFLICT (slug) DO NOTHING;
END $$;
