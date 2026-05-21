-- 2026-05-21: Retract Zoh Probiotics Organic Soybean Tempeh (id=36)
-- Applied directly to cloud DB via PostgREST PATCH; this file is the record.

BEGIN;

UPDATE public.products
   SET status = 'Retracted'::public.product_status
 WHERE slug = 'zoh-probiotics-soybean-tempeh';

COMMIT;
