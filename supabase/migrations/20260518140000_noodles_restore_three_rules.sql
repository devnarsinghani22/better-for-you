-- 2026-05-18: Restore three noodles rules — sodium, no artificial flavours,
-- no artificial colours. The two verbose manual rules (wholegrain ingredient
-- list, simple spice mix) stay deactivated.

UPDATE public.category_rules
SET active = true
WHERE id IN (18, 56, 57);
