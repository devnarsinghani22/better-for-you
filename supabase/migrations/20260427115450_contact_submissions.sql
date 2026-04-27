CREATE TABLE public.contact_submissions (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT,
  email       TEXT,
  reason      TEXT,
  message     TEXT NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
-- No public reads. Anonymous inserts allowed (rate-limited at app layer / via Supabase rate limits).
CREATE POLICY "contact_submissions_anon_insert"
  ON public.contact_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (length(message) BETWEEN 4 AND 5000);
