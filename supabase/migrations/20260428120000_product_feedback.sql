-- 2026-04-28: anonymous "was this helpful?" feedback for product detail pages.

BEGIN;

CREATE TABLE IF NOT EXISTS public.product_feedback (
  id            BIGSERIAL PRIMARY KEY,
  product_id    INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  helpful       BOOLEAN NOT NULL,
  visitor_hash  TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_feedback_product_idx
  ON public.product_feedback(product_id);

ALTER TABLE public.product_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated) can leave feedback for a Live product.
DROP POLICY IF EXISTS "feedback_anon_insert" ON public.product_feedback;
CREATE POLICY "feedback_anon_insert"
  ON public.product_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.status = 'Live'
    )
  );

-- Aggregated counts via SECURITY DEFINER RPC, since RLS blocks anon SELECT
-- on the underlying table. Function only returns counts, never raw rows.
CREATE OR REPLACE FUNCTION public.get_feedback_counts(p_product_id INT)
RETURNS TABLE (helpful_count BIGINT, unhelpful_count BIGINT, total_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*) FILTER (WHERE helpful)     AS helpful_count,
    COUNT(*) FILTER (WHERE NOT helpful) AS unhelpful_count,
    COUNT(*)                            AS total_count
  FROM public.product_feedback
  WHERE product_id = p_product_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_feedback_counts(INT) TO anon, authenticated;

COMMIT;
