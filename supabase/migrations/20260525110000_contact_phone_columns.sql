-- Clean phone storage for "notify me" signups (and any future contact rows).
-- Splits the phone out of the free-text `message` into proper columns so the
-- data is easy to clean/export. Additive + nullable: invisible on prod (public
-- pages never read these; the admin select is `*` so it tolerates them either way).
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL editor → New query).
alter table public.contact_submissions
  add column if not exists phone_cc text,
  add column if not exists phone text;

comment on column public.contact_submissions.phone_cc is 'Phone country / extension code, e.g. +91';
comment on column public.contact_submissions.phone is 'Phone number digits (without the country code)';
