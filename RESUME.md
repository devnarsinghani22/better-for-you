# Plan 1 — DONE ✓

Site is live at **https://foodpharmer-approved.vercel.app/**

## What's running

| Resource | Where | Detail |
|---|---|---|
| Public site | https://foodpharmer-approved.vercel.app/ | 5 category cards, ISR (60s) |
| Admin login | https://foodpharmer-approved.vercel.app/login | Magic link via Supabase Auth |
| Admin dashboard | https://foodpharmer-approved.vercel.app/admin | Auth-gated; redirects to /login if not signed in |
| Supabase project | `eprwzftfxtkgunnkewyk` (Mumbai, ap-south-1) | https://supabase.com/dashboard/project/eprwzftfxtkgunnkewyk |
| GitHub repo | https://github.com/devnarsinghani22/foodpharmer-approved | Private, master branch |
| Vercel project | `foodpharmer-approved` | https://vercel.com/devnarsinghani22s-projects/foodpharmer-approved |

## Try it

1. Open https://foodpharmer-approved.vercel.app/admin → redirects to login
2. Enter your email (any inbox you can read) → "Check your inbox for a magic link"
3. Click the link in the email → land on `/admin`, see your email + dashboard placeholder
4. Click "Sign out" → back to home

## Local dev

```bash
cd ~/foodpharmer-approved
npm run dev          # http://localhost:3000
npm test             # RLS smoke tests against cloud DB
npm run db:types     # regenerate lib/supabase/types.ts after migrations
```

`.env.local` already populated with project URL, anon key, service-role key, and DB password.

## Action items for you (when you have a minute)

1. **Revoke the two tokens you gave me** — they're no longer needed for active deploys (Vercel will use GitHub-app deploys once you install the GitHub app):
   - https://supabase.com/dashboard/account/tokens — delete `foodpharmer-approved-cli`
   - https://vercel.com/account/tokens — delete `foodpharmer-approved-cli`
2. **Install Vercel GitHub App** so deploys auto-trigger on `git push` (one-time, ~30s):
   - https://github.com/apps/vercel/installations/select_target → grant access to `foodpharmer-approved` repo
3. **(Later, when ready)** buy `foodpharmerapproved.com` domain and point Cloudflare DNS to Vercel — add custom domain in Vercel dashboard, ~5 min.

## What's next

**Plan 1 is done.** When you give the green light, I'll write **Plan 2: Product CRUD** — manual product entry + admin product list/editor + the rest of the schema (`brands`, `products`, `category_rules`, `product_rule_results`, `source_snapshots`, `audit_log`). This unblocks adding the ~17 seed products from your spreadsheet.

## Key file paths

- Spec: `docs/superpowers/specs/2026-04-27-foodpharmer-approved-design.md`
- Plan 1: `docs/superpowers/plans/2026-04-27-plan-1-foundation-skeleton.md`
- Plans 2–6: not yet written

## Commit log (latest at top)

```
fd640a9  feat: live deployment + metadata polish
ae89145  docs: add RESUME.md for picking up Plan 1 manual steps
5204525  docs: add .env.local.example
928d6a9  feat: scaffold Plan 1 Tasks 4-11 (code only)
1145d76  feat: add Supabase clients
ee5be65  chore: initialize Next.js 16 + TS + Tailwind v4
62b7d16  Add Plan 1: Foundation skeleton
c251ab5  Add FP-Approved design spec (v1)
```
