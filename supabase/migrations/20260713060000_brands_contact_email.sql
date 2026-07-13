-- Founder/brand contact for "your product is live" notifications.
-- Nullable: no email is sent when unset.
alter table public.brands add column if not exists contact_email text;
