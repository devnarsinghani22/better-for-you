-- 2026-05-18: Unit-spacing fixes + criteria-wording consistency pass
-- Applied directly to cloud DB via PostgREST; this file is the record.

BEGIN;

-- Unit spacing: no space between number and unit (per user direction)
UPDATE public.category_rules SET description = 'Sodium less than 300mg per 100g' WHERE id = 18;

-- Wording consistency: 'whole grain' -> 'wholegrain' so noodles matches biscuits/cookies wording
UPDATE public.category_rules SET description = 'Only wholegrain flour. No maida' WHERE id = 13;

-- Wording consistency: drop the optional 'of' so all macro rules read the same across categories
UPDATE public.category_rules SET description = 'At least 25g protein per 100g' WHERE id = 29;
UPDATE public.category_rules SET description = 'Less than 10g fat per 100g'    WHERE id = 30;
UPDATE public.category_rules SET description = 'Less than 10g fat per 100g'    WHERE id = 32;
UPDATE public.category_rules SET description = 'More than 15g protein per 100g' WHERE id = 47;
UPDATE public.category_rules SET description = 'More than 18g protein per 100g' WHERE id = 50;

-- Variant size: drop the stray space (visible on PDP next to product name)
UPDATE public.products SET variant_size = '1.25kg'   WHERE id = 8;
UPDATE public.products SET variant_size = '1kg'      WHERE id = 22;
UPDATE public.products SET variant_size = '1kg Tub'  WHERE id = 39;

COMMIT;
