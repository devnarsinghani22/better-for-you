-- ===== Admin allowlist =====
-- Use extensions.citext for case-insensitive email comparisons.
CREATE EXTENSION IF NOT EXISTS citext SCHEMA extensions;

CREATE TYPE public.admin_role AS ENUM ('preparer', 'reviewer');

CREATE TABLE public.admin_users (
  email      extensions.citext PRIMARY KEY,
  role       public.admin_role NOT NULL DEFAULT 'preparer',
  full_name  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper that the app calls server-side to gate /admin
CREATE OR REPLACE FUNCTION public.admin_role_for_email(p_email TEXT)
RETURNS public.admin_role
LANGUAGE sql STABLE AS $$
  SELECT role FROM public.admin_users WHERE email = p_email::extensions.citext
$$;

-- ===== Source snapshots (audit evidence) =====
CREATE TABLE public.source_snapshots (
  id              SERIAL PRIMARY KEY,
  product_id      INT REFERENCES public.products(id) ON DELETE CASCADE,
  source_url      TEXT NOT NULL,
  source_domain   TEXT,
  retrieved_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  screenshot_url  TEXT,
  raw_html_url    TEXT,
  extracted_text  TEXT,
  hash_sha256     TEXT,
  lab_report_url  TEXT
);

CREATE INDEX source_snapshots_product_idx ON public.source_snapshots(product_id, retrieved_at DESC);

ALTER TABLE public.source_snapshots ENABLE ROW LEVEL SECURITY;
-- No public reads on snapshots (admin/auditor only)

-- ===== Audit log (append-only) =====
CREATE TABLE public.audit_log (
  id              BIGSERIAL PRIMARY KEY,
  product_id      INT REFERENCES public.products(id) ON DELETE SET NULL,
  actor_user_id   UUID,
  actor_email     TEXT,
  action          TEXT NOT NULL,
  from_status     public.product_status,
  to_status       public.product_status,
  diff            JSONB,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_product_idx ON public.audit_log(product_id, created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
-- No public reads on audit log

-- ===== Admin_users RLS =====
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- No public read/write; service role bypasses RLS for admin queries

-- ===== Seed Dev as preparer (so admin gate works immediately) =====
INSERT INTO public.admin_users (email, role, full_name) VALUES
  ('dev.narsinghani@gmail.com', 'preparer', 'Dev Narsinghani')
ON CONFLICT (email) DO NOTHING;
-- Revant added later when his email is confirmed
