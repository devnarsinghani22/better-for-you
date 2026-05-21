-- 2026-05-21: Retract Nut Roasters HP Whey PB (id=20) + Kikibix Millet Chocolate Chip (id=4)
-- Applied directly to cloud DB via PostgREST PATCH; this file is the record.

BEGIN;

UPDATE public.products
   SET status = 'Retracted'::public.product_status
 WHERE slug IN ('nut-roasters-hp-whey-pb', 'millet-chocolate-chip');

COMMIT;
