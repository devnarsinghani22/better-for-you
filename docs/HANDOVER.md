# Better for You (foodpharmer.health) - Handover

Written 2026-07-16 for the transfer of the project from Dev Narsinghani to Shivam
(shivamagwl02@gmail.com). This file lists every account the project depends on, where
the secrets live, and the rules that keep the site cheap and on-brand. No secret values
are in this file or anywhere in git.

## What this project is

Next.js 16 app deployed on Vercel, data on Supabase, fronted by Cloudflare on
foodpharmer.health. Products are curated through an admin workflow
(Draft -> Vetted -> Live) at /admin. PROD deploys from `master`, staging previews from
`staging`.

## Accounts to transfer (in this order)

| # | Service | What | How |
|---|---------|------|-----|
| 1 | GitHub | repo `devnarsinghani22/better-for-you` | Settings -> transfer ownership to Shivam's GitHub account. Actions secrets move with the repo. |
| 2 | Vercel (paid team) | project `better-for-you` (id prj_RZB9OACBBjkLyiOGHBMcThanArXk) on team devnarsinghani22s-projects | Do NOT move the project. Invite Shivam to the team, promote to Owner, he replaces the payment method, Dev leaves. Env vars, domains and deploys stay untouched. Only the Git connection needs reconnecting after the GitHub repo transfer (step 1). |
| 3 | Supabase (paid org) | project `eprwzftfxtkgunnkewyk` (all data, storage, auth) | Do NOT migrate the project. Invite shivamagwl02@gmail.com to the org as Owner, he takes over billing, then Dev leaves the org. Zero downtime, keys unchanged. |
| 4 | Cloudflare | zone foodpharmer.health (DNS, cache rules, WAF scraper rules) + R2 bucket | Add Shivam as account member with admin, or move the zone to his account (if moved, recreate the cache rule on /storage/* and the WAF rules, and update nameservers at the registrar). |
| 5 | Domain registrar | foodpharmer.health | Wherever the domain is registered: transfer or add Shivam. Without this, nothing else can be re-pointed later. |
| 6 | Hostinger mail | hello@foodpharmer.net mailbox (SMTP sender for all site email) | Share mailbox credentials through a secure channel; rotate the password after handover. |
| 7 | Google Search Console | property foodpharmer.health + GCP service account `gsc-indexer` (Indexing API) | Add Shivam as GSC Owner. Share or re-create the service-account key (local file, not in git). |
| 8 | Microsoft Clarity | foodpharmer.health behavioural analytics | Add Shivam to the Clarity project team. API token is in env. |
| 9 | Site admin | /admin login (Supabase auth, roles preparer/reviewer) | Create a Supabase auth user for Shivam and grant the reviewer role. |

## Secrets inventory

All runtime secrets live in three places, never in git:

1. `.env.local` on the dev machine (hand over securely, then ROTATE everything):
   Supabase URL/anon/service-role/DB password/access token, Vercel token,
   CONTACT_EXPORT_TOKEN, Clarity API token, SMTP host/user/pass, Cloudflare API token +
   account + zone id, R2 access keys.
2. Vercel project env vars (production + preview) - same Supabase/SMTP set.
3. GitHub Actions repo secrets - Clarity token, Google SA JSON, Supabase keys, Vercel token.

After Dev's access ends, rotate: Supabase service-role key and DB password, Vercel token,
Cloudflare API token, R2 keys, SMTP password, CONTACT_EXPORT_TOKEN. Update the rotated
values in all three places above.

## Standing rules (do not break these)

- Push to `staging` only. `master` is production; deploy to it only deliberately, and
  purge the Cloudflare cache after every prod deploy (purge command is documented in
  `.env.local` comments).
- Cost guards are deliberate: Cloudflare cache rule on /storage/* absorbs Supabase
  egress; page and OG-image cache headers in `next.config.ts` and
  `app/c/[category]/[slug]/opengraph-image.tsx` keep Vercel compute low. Do not remove
  them. Target is under $25/mo across Vercel + Supabase.
- Copy rules for anything user-visible: never the words "healthier" or "cleaner"
  (brand line is "Better for You by Food Pharmer"), and no em dashes anywhere.
- This is a customized Next.js build. Read `node_modules/next/dist/docs/` before
  writing framework-level code (see AGENTS.md).
- sharp is pinned to 0.34.5 on purpose (must match Next's nested copy; a second libvips
  crashes the OG image route). `serverExternalPackages: ["sharp"]` in next.config.ts is
  part of the same fix.

## Scheduled automation (GitHub Actions in this repo)

- `clarity-digest.yml` - weekly analytics digest; surfaces as a notification to the repo
  owner, so it follows the repo transfer automatically.
- `monitor-usage.yml` - usage guardrail checks.
- `push-broadcast.yml` / `push-digest.yml` - mobile push sending (dormant; blocked on
  Firebase keys that were never provided).

## In flight at handover (2026-07-16)

- Founder notification feature (congrats email on first push-Live + per-product OG share
  card) is complete on `staging`, not yet on prod. Founder emails are entered at
  /admin/brands; most are still empty. Source for backfill: Harsh's brand-submissions
  Google Sheet.
- Oil Board lead magnet (/oil-board) is live on prod.
- Backlog: em-dash sweep of restaurant-vertical DB copy; product
  `taakat-hunger-bar-crunchy-coconut` has mismatched name "Hunger Bar Almond Delight" in
  the DB; UX audit backlog (CTA rename, homepage value prop, search ranking).
- Capacitor mobile app (health.foodpharmer.app) has a push foundation built but dormant;
  see docs/play-store-kit.md.
