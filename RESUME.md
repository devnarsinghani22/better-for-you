# Resume — Plan 1 status

Plan 1 is **~80% prepped**. All code is written and committed. Pending only your manual cloud setup steps.

## What's done (committed on `master`)

- Next.js 16.2.4 + React 19 + Tailwind v4 scaffolded
- `@supabase/ssr` clients (browser, server, middleware)
- Supabase CLI installed locally; `supabase init` done
- Migration `0001_categories` written (table + RLS public-read policy)
- Seed file `supabase/seed.sql` (5 categories)
- Public homepage fetches categories with ISR (`revalidate=60`)
- `/login` magic-link page + `/auth/callback` + `/auth/signout`
- `/admin` shell with auth-gated layout + dashboard placeholder
- Root `middleware.ts` enforcing `/admin` auth gate
- Vitest + dotenv installed; RLS smoke test ready
- npm scripts: `test`, `test:watch`, `db:types`
- `.env.local.example` committed (allowed past `.env*` gitignore via `!.env.local.example`)

Latest commits:

```
5204525 docs: add .env.local.example
928d6a9 feat: scaffold Plan 1 Tasks 4-11 (code only)
1145d76 feat: add Supabase clients
ee5be65 chore: initialize Next.js 16 + TS + Tailwind v4
62b7d16 Add Plan 1: Foundation skeleton
c251ab5 Add FP-Approved design spec (v1)
```

## What you need to do (in this order)

### 1. Create Supabase project (Plan 1 Task 3)

- `https://supabase.com/dashboard` → New Project
- Name: `foodpharmer-approved`
- Region: `Mumbai (ap-south-1)`
- Save the DB password somewhere safe — Supabase doesn't show it again

### 2. Paste env vars into `.env.local`

Copy `.env.local.example` to `.env.local`, then in Supabase dashboard → Project Settings → API, copy:

- `URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Link CLI to cloud project (Plan 1 Task 4 step 3)

```bash
cd ~/foodpharmer-approved
npx supabase link --project-ref <your-project-ref>
```

(`<your-project-ref>` is the slug after `https://` in your project URL.)

### 4. Apply migration

```bash
npx supabase db push
```

Verify in Supabase dashboard → Table Editor → `categories` table exists.

### 5. Apply seed data

Open Supabase dashboard → SQL Editor → New Query → paste contents of `supabase/seed.sql` → Run. Verify 5 rows in `categories`.

### 6. Generate TypeScript types

```bash
npm run db:types
```

Creates `lib/supabase/types.ts` from your linked project's schema.

### 7. Configure Auth redirect URLs

Supabase dashboard → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: add `http://localhost:3000/auth/callback`

### 8. Smoke test locally

```bash
npm run dev
```

- Visit `http://localhost:3000` → 5 category cards
- Visit `/admin` → redirect to `/login`
- Submit your email → check inbox → click magic link → land on `/admin`
- Click "Sign out" → redirect home

```bash
npm test
```

Both RLS tests should pass.

### 9. Commit env-file types and push to GitHub

```bash
git add lib/supabase/types.ts
git commit -m "chore: generate initial DB types"

# Create a private GitHub repo, then:
git remote add origin git@github.com:<you>/foodpharmer-approved.git
git push -u origin master
```

### 10. Connect Vercel

- `https://vercel.com/new` → import repo
- Add env vars (Production + Preview + Development): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Deploy
- Add Vercel URL to Supabase Auth Redirect URLs: `https://<your-vercel-domain>/auth/callback`

When this is done, Plan 1 is complete. Tell me, and I'll start Plan 2 (Product CRUD).

## Spec & Plan locations

- Spec: `docs/superpowers/specs/2026-04-27-foodpharmer-approved-design.md`
- Plan 1: `docs/superpowers/plans/2026-04-27-plan-1-foundation-skeleton.md`
- Plans 2–6: not yet written (each will be drafted as we approach it)
