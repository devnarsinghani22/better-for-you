CREATE TABLE public.categories (
  id              SERIAL PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  serving_size_g  INT,
  serving_label   TEXT,
  blurb           TEXT,
  display_order   INT NOT NULL DEFAULT 100,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public read access for active categories only
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (active = true);
