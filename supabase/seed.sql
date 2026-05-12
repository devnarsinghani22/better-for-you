-- Seed categories
INSERT INTO public.categories (slug, name, serving_size_g, serving_label, blurb, display_order)
VALUES
  ('rusks',         'Rusks',          100, 'per 100g', 'Wholegrain rusks without maida or artificial colours.',         10),
  ('biscuits',      'Biscuits',       100, 'per 100g', 'Biscuits made from wholegrains, low in sugar, high in fibre.', 20),
  ('noodles',       'Noodles',        100, 'per 100g', 'Noodles with clean spice mixes and lower sodium.',             30),
  ('paneer',        'Paneer',         100, 'per 100g', 'Paneer made from real milk and an acidic agent — lab-tested.', 40),
  ('peanut-butter', 'Peanut Butter',  100, 'per 100g', '100% peanuts (or peanuts + whey), nothing else.',              50)
ON CONFLICT (slug) DO NOTHING;
