-- Per-category rules + universal rules. category_id NULL = universal.
CREATE TABLE public.category_rules (
  id              SERIAL PRIMARY KEY,
  category_id     INT REFERENCES public.categories(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  description     TEXT NOT NULL,
  evaluator_kind  TEXT NOT NULL CHECK (evaluator_kind IN
    ('boolean', 'threshold_lt', 'threshold_lte', 'threshold_gt', 'threshold_gte', 'regex_absent', 'manual')),
  threshold_value NUMERIC,
  threshold_unit  TEXT,
  is_required     BOOLEAN NOT NULL DEFAULT true,
  display_order   INT NOT NULL DEFAULT 100,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX category_rules_category_idx ON public.category_rules(category_id, display_order);

ALTER TABLE public.category_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "category_rules_public_read"
  ON public.category_rules FOR SELECT TO anon, authenticated
  USING (active = true);

-- Per-product rule evaluation results (computed at submit time, frozen at approval).
-- Empty for now — Plan 6 will hook the engine; for v1 we display the static rules block.
CREATE TABLE public.product_rule_results (
  product_id    INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rule_id       INT NOT NULL REFERENCES public.category_rules(id) ON DELETE CASCADE,
  passed        BOOLEAN NOT NULL,
  observed      JSONB,
  evaluated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, rule_id)
);

ALTER TABLE public.product_rule_results ENABLE ROW LEVEL SECURITY;

-- Public read of rule results — only for Live products
CREATE POLICY "product_rule_results_public_read_live"
  ON public.product_rule_results FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_rule_results.product_id AND p.status = 'Live'
  ));
