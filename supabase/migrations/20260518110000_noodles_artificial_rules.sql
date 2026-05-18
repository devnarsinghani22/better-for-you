-- 2026-05-18: Add "No artificial flavours" and "No artificial colours" to noodles criteria
-- Applied directly to cloud DB via PostgREST; this file is the record.

INSERT INTO public.category_rules (category_id, code, description, evaluator_kind, is_required, display_order)
SELECT id, 'no_artificial_flavours', 'No artificial flavours', 'boolean', true, 40
FROM public.categories WHERE slug = 'noodles'
ON CONFLICT DO NOTHING;

INSERT INTO public.category_rules (category_id, code, description, evaluator_kind, is_required, display_order)
SELECT id, 'no_artificial_colours', 'No artificial colours', 'boolean', true, 50
FROM public.categories WHERE slug = 'noodles'
ON CONFLICT DO NOTHING;
