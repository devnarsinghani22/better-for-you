-- 2026-05-18: Retire curd category + rename yogurt to 'Yogurt (High-Protein)'
-- Curd is soft-deleted (active=false) so the 6 product rows and their
-- rule-evaluation history stay intact and can be re-activated later.

BEGIN;

UPDATE public.categories SET active = false           WHERE slug = 'curd';
UPDATE public.categories SET name = 'Yogurt (High-Protein)' WHERE slug = 'yogurt';

COMMIT;
