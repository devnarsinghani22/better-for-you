-- Brands
CREATE TABLE public.brands (
  id               SERIAL PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  website_url      TEXT,
  is_excluded      BOOLEAN NOT NULL DEFAULT false,
  exclusion_reason TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enums
CREATE TYPE public.product_status AS ENUM (
  'Draft',
  'PendingReview',
  'NeedsClarification',
  'Approved',
  'Rejected',
  'Live',
  'Retracted'
);

CREATE TYPE public.certification_method AS ENUM (
  'label_tested',
  'lab_tested',
  'both'
);

CREATE TYPE public.product_rating AS ENUM ('A+', 'A', 'B+', 'B', 'C', 'D');

-- Products
CREATE TABLE public.products (
  id                   SERIAL PRIMARY KEY,
  slug                 TEXT UNIQUE NOT NULL,
  name                 TEXT NOT NULL,
  brand_id             INT NOT NULL REFERENCES public.brands(id),
  category_id          INT NOT NULL REFERENCES public.categories(id),
  variant_size         TEXT,
  description_md       TEXT,

  status               public.product_status NOT NULL DEFAULT 'Draft',
  certification_method public.certification_method NOT NULL DEFAULT 'label_tested',
  rating               public.product_rating,
  verdict              TEXT GENERATED ALWAYS AS (
                         CASE WHEN rating IN ('A+'::public.product_rating, 'A'::public.product_rating)
                              THEN 'Approved' ELSE 'Not Approved' END
                       ) STORED,

  product_photo_url    TEXT,
  label_image_url      TEXT,
  ingredient_image_url TEXT,

  ingredients_raw      TEXT,
  ingredients_parsed   JSONB,
  nutrition            JSONB,
  contains_flags       JSONB,

  primary_buy_url      TEXT,
  alt_buy_urls         JSONB,

  prepared_by          UUID,
  prepared_at          TIMESTAMPTZ,
  reviewed_by          UUID,
  reviewed_at          TIMESTAMPTZ,
  review_notes         TEXT,

  last_verified_at     TIMESTAMPTZ,
  reverify_due_at      TIMESTAMPTZ,
  retracted_at         TIMESTAMPTZ,
  retraction_reason    TEXT,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX products_status_category_idx ON public.products(status, category_id);
CREATE INDEX products_reverify_due_idx
  ON public.products(reverify_due_at) WHERE status = 'Live';

-- RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_public_read"
  ON public.brands FOR SELECT TO anon, authenticated
  USING (is_excluded = false);

CREATE POLICY "products_public_read_live"
  ON public.products FOR SELECT TO anon, authenticated
  USING (status = 'Live');

-- updated_at auto-bump
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_touch_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
