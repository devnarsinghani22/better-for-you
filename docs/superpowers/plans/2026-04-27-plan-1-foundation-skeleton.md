# Plan 1: Foundation Skeleton

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a deployable Next.js 15 + Supabase project with magic-link auth gating `/admin`, the `categories` table seeded with 5 rows, and a public homepage that lists those categories. Output: a live `*.vercel.app` URL where Dev can log in.

**Architecture:** Next.js 15 App Router with TypeScript and Tailwind (whatever `create-next-app` ships — v3 at writing). Supabase (cloud) for Postgres + Auth + Storage. `@supabase/ssr` for server-side rendering with cookies. Public homepage uses ISR (`revalidate = 60`); deeper revalidation strategies come in later plans. Admin routes gated by middleware that checks Supabase session.

**Tech Stack:** Next.js 15 · React 19 · TypeScript · Tailwind · Supabase (postgres, auth, storage) · `@supabase/ssr` · Vercel · Git/GitHub

**Repository:** `~/foodpharmer-approved/` (already `git init`'d in spec phase, on `main`)

**Note on tests:** Per project preference, this plan includes tests only for load-bearing logic (RLS gating). UI/CRUD tasks ship without test ceremony.

---

## File Structure

| Path | Purpose |
|---|---|
| `package.json` | Dependencies, scripts |
| `next.config.ts` | Next.js config |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.ts` | Tailwind config |
| `app/globals.css` | Tailwind base + theme tokens |
| `app/layout.tsx` | Root layout (fonts, body shell) |
| `app/page.tsx` | Public homepage — lists categories |
| `app/login/page.tsx` | Magic-link login |
| `app/(admin)/admin/layout.tsx` | Admin shell |
| `app/(admin)/admin/page.tsx` | Admin dashboard placeholder |
| `app/auth/callback/route.ts` | Supabase auth callback handler |
| `app/auth/signout/route.ts` | Signout handler |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client (with cookies) |
| `lib/supabase/middleware.ts` | Session refresh helper |
| `lib/supabase/types.ts` | Generated DB types |
| `middleware.ts` | Next.js middleware — gates `/admin/*` |
| `supabase/config.toml` | Supabase CLI config |
| `supabase/migrations/0001_categories.sql` | Categories schema |
| `supabase/seed.sql` | Seed data — 5 categories |
| `tests/rls/categories-rls.test.ts` | RLS smoke test |
| `.env.local.example` | Env var template |
| `.gitignore` | Ignore `.env.local`, `node_modules`, `.next`, `.superpowers`, etc. |
| `README.md` | Bare-bones — repo intro + run instructions |

---

## Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`

- [ ] **Step 1: Run `create-next-app`**

```bash
cd ~/foodpharmer-approved
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*" --eslint --no-turbopack
```
Answer prompts: yes to overwrite if it complains about existing files. The repo is otherwise empty except for `docs/`.

Expected: `package.json`, `app/`, `tsconfig.json` etc. created.

- [ ] **Step 2: Verify dev server boots**

```bash
npm run dev
```
Expected: dev server at `http://localhost:3000`, default Next.js page loads. Kill the server (Ctrl+C) before next step.

- [ ] **Step 3: Update `.gitignore`**

Append the following to `.gitignore`:
```
# Local env
.env.local
.env*.local

# Brainstorm artifacts
.superpowers/

# Supabase
supabase/.branches/
supabase/.temp/
```

- [ ] **Step 4: Strip default boilerplate from `app/page.tsx`**

Replace `app/page.tsx` contents with:
```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Food Pharmer Approved</h1>
      <p className="mt-2 text-gray-600">Coming soon.</p>
    </main>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js 15 + TS + Tailwind"
```

---

## Task 2: Install Supabase dependencies and create clients

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Supabase packages**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Create `lib/supabase/client.ts` (browser client)**

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Create `lib/supabase/server.ts` (server client with cookies)**

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — ignore; middleware handles refresh.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create `lib/supabase/middleware.ts` (session refresh)**

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Gate /admin/*
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    !user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/ package.json package-lock.json
git commit -m "feat: add Supabase clients and session-refresh middleware"
```

---

## Task 3: Create Supabase project and wire env vars

**Files:**
- Create: `.env.local`, `.env.local.example`

- [ ] **Step 1: Create Supabase cloud project**

Manual step. Visit `https://supabase.com/dashboard` → New Project → Name: `foodpharmer-approved` → Region: `Mumbai (ap-south-1)` → Wait for provisioning.

- [ ] **Step 2: Copy project URL + anon key**

From Supabase dashboard → Project Settings → API → copy:
- `URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key (for later admin tasks) → `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **Step 3: Create `.env.local`**

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

- [ ] **Step 4: Create `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

- [ ] **Step 5: Commit (only the example, not the actual secrets)**

```bash
git add .env.local.example
git commit -m "docs: add env var example file"
```
Verify `.env.local` is NOT staged (`.gitignore` should exclude it).

---

## Task 4: Install Supabase CLI and link project

**Files:**
- Create: `supabase/config.toml`

- [ ] **Step 1: Install Supabase CLI**

```bash
npm install -D supabase
```
(Project-local install; avoids global Windows path issues.)

- [ ] **Step 2: Initialize Supabase locally**

```bash
npx supabase init
```
Expected: creates `supabase/` directory with `config.toml`. Decline the VS Code settings prompt (`n`).

- [ ] **Step 3: Link to the cloud project**

```bash
npx supabase link --project-ref <your-project-ref>
```
You'll be prompted for the database password (set during project creation). If you forgot it, reset it from the Supabase dashboard.

- [ ] **Step 4: Commit**

```bash
git add supabase/ package.json package-lock.json
git commit -m "chore: init Supabase CLI and link project"
```

---

## Task 5: Migration — categories table

**Files:**
- Create: `supabase/migrations/0001_categories.sql`

- [ ] **Step 1: Create the migration file**

```bash
npx supabase migration new categories
```
Expected: creates `supabase/migrations/<timestamp>_categories.sql`. Note the actual filename — it will have a timestamp prefix.

- [ ] **Step 2: Write the schema in the migration file**

Replace contents with:
```sql
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
```

- [ ] **Step 3: Push the migration to cloud**

```bash
npx supabase db push
```
Expected: "Applying migration..." → success. Verify in Supabase dashboard → Table Editor → `categories` table exists with the columns above.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat(db): add categories table with public-read RLS"
```

---

## Task 6: Seed 5 categories

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Write seed file**

Create `supabase/seed.sql`:
```sql
-- Seed categories
INSERT INTO public.categories (slug, name, serving_size_g, serving_label, blurb, display_order)
VALUES
  ('rusks',         'Rusks',          100, 'per 100g', 'Wholegrain rusks without maida or artificial colors.',      10),
  ('biscuits',      'Biscuits',       100, 'per 100g', 'Biscuits made from wholegrains, low in sugar, high in fibre.', 20),
  ('noodles',       'Noodles',        100, 'per 100g', 'Noodles with clean spice mixes and lower sodium.',           30),
  ('paneer',        'Paneer',         100, 'per 100g', 'Paneer made from real milk and an acidic agent — lab-tested.', 40),
  ('peanut-butter', 'Peanut Butter',  100, 'per 100g', '100% peanuts (or peanuts + whey), nothing else.',           50)
ON CONFLICT (slug) DO NOTHING;
```

- [ ] **Step 2: Apply seed via SQL Editor in Supabase dashboard**

Go to Supabase dashboard → SQL Editor → New Query → paste the above SQL → Run.

(Reason: `supabase db reset` would wipe the DB on every run, which is undesirable for a linked cloud project. Manual seed via SQL editor for now; we'll automate seeds in a later plan when we add many product rows.)

Expected: 5 rows in `public.categories`. Verify via Table Editor.

- [ ] **Step 3: Commit the seed file**

```bash
git add supabase/seed.sql
git commit -m "feat(db): seed 5 launch categories"
```

---

## Task 7: Generate TypeScript types from DB

**Files:**
- Create: `lib/supabase/types.ts`
- Modify: `package.json`

- [ ] **Step 1: Add a `db:types` script to `package.json`**

In `package.json` `scripts`:
```json
"scripts": {
  ...,
  "db:types": "supabase gen types typescript --linked > lib/supabase/types.ts"
}
```

- [ ] **Step 2: Run it**

```bash
npm run db:types
```
Expected: `lib/supabase/types.ts` created with `Database` interface containing `categories` table types.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/types.ts package.json
git commit -m "chore: add db:types script and generate initial types"
```

---

## Task 8: Public homepage lists categories

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update `app/page.tsx` to fetch and render**

Replace contents with:
```tsx
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60; // ISR — re-fetch at most every 60s

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, slug, name, blurb')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) {
    return <main className="p-8">Error loading: {error.message}</main>;
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold">Food Pharmer Approved</h1>
      <p className="mt-2 text-gray-600">
        Products Food Pharmer would actually buy.
      </p>

      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((c) => (
          <article
            key={c.id}
            className="border rounded-lg p-5 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{c.name}</h2>
            <p className="mt-2 text-sm text-gray-600">{c.blurb}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Run dev server and verify**

```bash
npm run dev
```
Open `http://localhost:3000`. Expected: 5 category cards (Rusks, Biscuits, Noodles, Paneer, Peanut Butter) with their blurbs. Kill the server.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: homepage lists categories from Supabase"
```

---

## Task 9: Login page (magic link)

**Files:**
- Create: `app/login/page.tsx`, `app/auth/callback/route.ts`

- [ ] **Step 1: Configure Supabase Auth allowed redirect URLs**

In Supabase dashboard → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: add `http://localhost:3000/auth/callback` and (later) `https://<your-vercel-domain>/auth/callback`

- [ ] **Step 2: Create login page `app/login/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Admin login</h1>
        {sent ? (
          <p className="text-green-700">Check your inbox for a magic link.</p>
        ) : (
          <>
            <input
              type="email"
              required
              placeholder="you@onlywhatsneeded.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <button
              type="submit"
              className="w-full bg-black text-white rounded py-2"
            >
              Send magic link
            </button>
            {err && <p className="text-red-600 text-sm">{err}</p>}
          </>
        )}
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Create auth callback route `app/auth/callback/route.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

- [ ] **Step 4: Commit**

```bash
git add app/login app/auth/callback
git commit -m "feat: magic-link login + auth callback"
```

---

## Task 10: Admin shell + signout + middleware gate

**Files:**
- Create: `app/(admin)/admin/layout.tsx`, `app/(admin)/admin/page.tsx`, `app/auth/signout/route.ts`, `middleware.ts`

- [ ] **Step 1: Create admin layout `app/(admin)/admin/layout.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');

  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-semibold">FP Admin</Link>
        <div className="text-sm flex items-center gap-4">
          <span className="text-gray-600">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="underline">Sign out</button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create admin home `app/(admin)/admin/page.tsx`**

```tsx
export default function AdminHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <p className="mt-2 text-gray-600">
        Product CRUD coming in Plan 2.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create signout route `app/auth/signout/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL('/', request.url);
  return NextResponse.redirect(url, { status: 302 });
}
```

- [ ] **Step 4: Create root `middleware.ts`**

```ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on everything except static assets and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 5: Verify locally end-to-end**

```bash
npm run dev
```
1. Visit `http://localhost:3000/admin` — expected redirect to `/login?next=/admin`
2. Submit your email — expected "Check your inbox"
3. Click the magic link in your email — expected redirect to `/admin` showing your email and the dashboard placeholder
4. Click "Sign out" — expected redirect to `/`
5. Visit `/admin` again — expected redirect to `/login`

Kill the server.

- [ ] **Step 6: Commit**

```bash
git add app/\(admin\) app/auth/signout middleware.ts
git commit -m "feat: admin shell, middleware auth gate, signout"
```

---

## Task 11: RLS smoke test

**Files:**
- Create: `tests/rls/categories-rls.test.ts`, `vitest.config.ts`
- Modify: `package.json`

This is a load-bearing test: it confirms that public anon access can read categories AND that RLS is actually enabled (a missing policy is the kind of bug that only shows up in prod).

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Install dotenv loader and create `vitest.config.ts`**

```bash
npm install -D dotenv
```

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

config({ path: '.env.local' });

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add test scripts to `package.json`**

```json
"scripts": {
  ...,
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Write failing RLS test**

Create `tests/rls/categories-rls.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

describe('categories RLS', () => {
  it('anon role can read active categories', async () => {
    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase
      .from('categories')
      .select('slug, name')
      .eq('active', true);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThanOrEqual(5);
    const slugs = data!.map((c) => c.slug).sort();
    expect(slugs).toEqual(
      ['biscuits', 'noodles', 'paneer', 'peanut-butter', 'rusks']
    );
  });

  it('anon role cannot insert into categories', async () => {
    const supabase = createClient(url, anonKey);
    const { error } = await supabase
      .from('categories')
      .insert({ slug: 'evil', name: 'Evil', display_order: 999 });
    expect(error).not.toBeNull();
  });
});
```

- [ ] **Step 5: Run the tests**

```bash
npm test
```
(Vitest config above pre-loads `.env.local` via dotenv.)

Expected: both tests pass. If the second fails (insert succeeds), RLS is misconfigured — recheck Task 5 step 2.

- [ ] **Step 6: Commit**

```bash
git add tests/ vitest.config.ts package.json package-lock.json
git commit -m "test(rls): smoke-test categories public-read and write-deny"
```

---

## Task 12: Deploy to Vercel

**Files:** none (deployment config is dashboard-driven)

- [ ] **Step 1: Push branch to GitHub**

Create a new GitHub repo `foodpharmer-approved` (private). Then:
```bash
git remote add origin git@github.com:<your-user>/foodpharmer-approved.git
git push -u origin main
```

- [ ] **Step 2: Connect Vercel**

Visit `https://vercel.com/new` → import the repo → keep defaults (framework: Next.js detected).

- [ ] **Step 3: Set environment variables in Vercel**

Add to Vercel project Settings → Environment Variables (Production + Preview + Development):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

(Same values as `.env.local`.)

- [ ] **Step 4: Trigger first deploy**

Click "Deploy". Wait for the build (~2 min).

Expected: a `*.vercel.app` URL is live.

- [ ] **Step 5: Update Supabase Auth redirect URLs**

Back in Supabase dashboard → Authentication → URL Configuration → add:
- Redirect URL: `https://<your-vercel-domain>/auth/callback`
- Site URL: keep `http://localhost:3000` (so dev works) — alternatively use the Vercel domain. Both can coexist via the redirect-URL allowlist.

- [ ] **Step 6: Smoke-test the deployed URL**

1. Visit `https://<your-vercel-domain>/` — expected: 5 category cards.
2. Visit `/admin` — expected: redirect to `/login`.
3. Sign in with magic link — expected: works end-to-end.
4. Visit `/` after sign-in — still loads. Sign out — redirects home.

- [ ] **Step 7: Commit any final config changes**

If you added a `vercel.json` or modified anything, commit it. Otherwise nothing to commit — Vercel deploys from the existing `main`.

---

## Plan 1 — Self-Review

Spec coverage check:

| Spec section | Plan 1 task |
|---|---|
| §3 Architecture · Public site | ✓ Task 8 — homepage SSR/ISR |
| §3 Architecture · Admin gate | ✓ Tasks 9, 10 — login, middleware |
| §3 Architecture · Supabase + RLS | ✓ Tasks 4, 5, 11 |
| §4 Data model · `categories` | ✓ Task 5 |
| §5 5 launch categories | ✓ Task 6 — seeded |
| §9 Permissions · public anon SELECT only | ✓ Task 5 RLS policy + Task 11 test |
| §13 Success criteria · public site loads <1.5s | ✓ Task 12 — Vercel ISR |

Not covered in Plan 1 (intentionally — these are Plans 2-6):
- `brands`, `products`, `category_rules`, `product_rule_results`, `source_snapshots`, `audit_log` tables
- Scraper API
- Admin UI for products
- Approval workflow (Revant's queue)
- Public product/category detail pages
- Re-verification cron, retract, brand exclusion warnings

Placeholder scan: clean. No TBD/TODO. All env-var values use `<placeholder>` strings the engineer fills with real values from the Supabase dashboard — this is required user action, not a plan placeholder.

Type consistency: only one schema (`categories`) and types are auto-generated in Task 7 from the DB. No type drift possible.

---

## Done state

After all 12 tasks:
- `https://<vercel-domain>/` shows 5 category tiles
- `/admin` is gated; magic-link auth works on email
- `categories` table is RLS-protected (public read, anon write blocked, smoke-tested)
- Repo is on GitHub `main`, deployed via Vercel, env vars set in Vercel
- Supabase CLI is linked; future migrations apply via `npx supabase db push`

Ready to start Plan 2 (Product CRUD).
