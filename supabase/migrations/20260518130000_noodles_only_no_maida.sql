-- 2026-05-18: Simplify noodles criteria — keep only "No maida"
-- All other rules soft-deleted (active = false) so product_rule_results
-- history is preserved. Applied directly to cloud DB via PostgREST.

UPDATE public.category_rules
SET active = false
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'noodles')
  AND code != 'noodle_no_maida';
