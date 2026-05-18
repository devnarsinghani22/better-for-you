-- 2026-05-18: Paneer (regular) criteria swap + 'Lab tested' wording polish
--
-- Removed: 'No palm oil (real paneer)' (id=43, soft-deleted)
-- Added: 'No vegetable oil' (boolean, display 20) and 'No starch' (boolean, display 30)
-- Renamed: 'Lab tested' -> 'Lab tested by Food Pharmer' (id=42)

BEGIN;

UPDATE public.category_rules SET active = false WHERE id = 43;

INSERT INTO public.category_rules (category_id, code, description, evaluator_kind, is_required, display_order)
SELECT id, 'paneer_no_vegetable_oil', 'No vegetable oil', 'boolean', true, 20
FROM public.categories WHERE slug = 'paneer'
ON CONFLICT DO NOTHING;

INSERT INTO public.category_rules (category_id, code, description, evaluator_kind, is_required, display_order)
SELECT id, 'paneer_no_starch', 'No starch', 'boolean', true, 30
FROM public.categories WHERE slug = 'paneer'
ON CONFLICT DO NOTHING;

UPDATE public.category_rules SET description = 'Lab tested by Food Pharmer' WHERE id = 42;

COMMIT;
