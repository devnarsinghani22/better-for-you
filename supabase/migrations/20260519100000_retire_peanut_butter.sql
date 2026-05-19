-- 2026-05-19: Retire peanut butter category (soft-delete).
-- Hides it from the home page and /criteria. Products + rule history preserved.

BEGIN;

UPDATE public.categories SET active = false WHERE slug = 'peanut-butter';

COMMIT;
