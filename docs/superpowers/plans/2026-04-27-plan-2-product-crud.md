# Plan 2: Product CRUD + first 17 products live

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `brands` and `products` tables (with enums, generated verdict, RLS), seed the 17 approved products from Dev's spreadsheet, build a basic admin product list/create/edit, and stand up minimal public category + product pages so the seed products are visible at `/c/[category]/[slug]`.

**Out of scope (deferred):** approval workflow (Plan 3), source snapshots (Plan 3), category_rules engine (Plan 3), scraper (Plan 4), product page polish — image lightbox, source citation panel, "why it passes" rule grid (Plan 5).

**Architecture:** Migrations expand the schema. Server components fetch with the Supabase server client (RLS-gated for public, service-role for admin via auth-checked API routes). Admin pages reuse the existing `/admin` shell.

---

## File structure

| Path | Purpose |
|---|---|
| `supabase/migrations/<ts>_brands_and_products.sql` | New tables + enums + RLS |
| `supabase/migrations/<ts>_seed_brands_and_products.sql` | Seed brands + 17 approved products as Live |
| `lib/supabase/admin.ts` | Service-role client for admin write paths |
| `lib/products/types.ts` | Re-exports DB types with handy aliases |
| `lib/products/queries.ts` | Common product fetches (live by category, by slug) |
| `app/page.tsx` | Update to show approved counts per category |
| `app/c/[category]/page.tsx` | Category landing — grid of approved products |
| `app/c/[category]/[slug]/page.tsx` | Basic product detail (photo, brand, name, ingredients, criteria) |
| `app/(admin)/admin/products/page.tsx` | List view + filters |
| `app/(admin)/admin/products/new/page.tsx` | Create form |
| `app/(admin)/admin/products/[id]/page.tsx` | Edit form |
| `app/(admin)/admin/products/_form.tsx` | Shared form component (server actions) |
| `app/(admin)/admin/products/_actions.ts` | Server actions: create/update/delete |
| `tests/rls/products-rls.test.ts` | Public can SELECT only Live; anon write blocked |

---

## Task 1: Migration — `brands` + `products` schema

**File:** `supabase/migrations/<ts>_brands_and_products.sql`

```sql
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

-- Public can read brands referenced by Live products.
-- (Simple version: read all non-excluded brands. Tighten later.)
CREATE POLICY "brands_public_read"
  ON public.brands FOR SELECT TO anon, authenticated
  USING (is_excluded = false);

-- Public reads only Live products.
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
```

**Steps:**
- [ ] `npx supabase migration new brands_and_products`
- [ ] Paste the SQL above into the new migration file
- [ ] `npx supabase db push` (after exporting `SUPABASE_ACCESS_TOKEN` + `SUPABASE_DB_PASSWORD`)
- [ ] Verify in dashboard → Table Editor → `brands` and `products` tables exist
- [ ] `npm run db:types` — regenerate `lib/supabase/types.ts`
- [ ] Commit: `feat(db): add brands and products tables with RLS`

---

## Task 2: Seed brands + 17 approved products

**File:** `supabase/migrations/<ts>_seed_brands_and_products.sql`

The 17 approved products from `Packaged Food - Data` tab (rating A or A+):
- **Rusks (2):** Zero Maida Rusk (The Health Factory), Millet Rusk (Early Foods)
- **Biscuits (2):** Millet Jaggery Cookies (Early Foods), Millet Chocolate Chip (Kikibix)
- **Noodles (2):** Wheat Noodles (Little Moppet Foods), Quinoa Noodles (Naturally Yours)
- **Peanut Butter (4):** Pintola Crunchy ⚠️, Myfitness Crunchy, Pintola High Protein, Nut Roasters Crunchy A+
- **Paneer (7, lab-tested):** Amul Fresh, Amul Malai, Gowardhan, Humpy A2, Desi Farms Low Fat, ID Fresh High Protein, Milky Mist High Protein

**⚠️ Pintola flag:** seeded as `status='Draft'` (not Live) until Dev verifies Pintola does/doesn't make whey/protein. The other Pintola entry, Pintola High Protein A+, has the same brand exclusion concern — both seed as Draft.

```sql
-- Brands
INSERT INTO public.brands (slug, name) VALUES
  ('the-health-factory',  'The Health Factory'),
  ('early-foods',         'Early Foods'),
  ('kikibix',             'Kikibix'),
  ('little-moppet-foods', 'Little Moppet Foods'),
  ('naturally-yours',     'Naturally Yours'),
  ('myfitness',           'Myfitness'),
  ('nut-roasters',        'Nut Roasters'),
  ('amul',                'Amul'),
  ('gowardhan',           'Gowardhan'),
  ('humpy',               'Humpy A2'),
  ('desi-farms',          'Desi Farms'),
  ('id-fresh',            'ID Fresh'),
  ('milky-mist',          'Milky Mist')
ON CONFLICT (slug) DO NOTHING;

-- Pintola — flagged for brand-exclusion review (does it make whey?)
INSERT INTO public.brands (slug, name, is_excluded, exclusion_reason)
VALUES ('pintola', 'Pintola', false, 'Pending verification: does Pintola produce whey/protein? If yes → exclude per OWN-competitor policy.')
ON CONFLICT (slug) DO NOTHING;

-- Products — 17 approved entries, lab-tested for paneer, label-tested for the rest.
-- Pintola entries kept as Draft pending brand-exclusion review.

DO $$
DECLARE
  c_rusks INT;
  c_biscuits INT;
  c_noodles INT;
  c_paneer INT;
  c_pb INT;
BEGIN
  SELECT id INTO c_rusks    FROM public.categories WHERE slug = 'rusks';
  SELECT id INTO c_biscuits FROM public.categories WHERE slug = 'biscuits';
  SELECT id INTO c_noodles  FROM public.categories WHERE slug = 'noodles';
  SELECT id INTO c_paneer   FROM public.categories WHERE slug = 'paneer';
  SELECT id INTO c_pb       FROM public.categories WHERE slug = 'peanut-butter';

  -- Rusks
  INSERT INTO public.products (slug, name, brand_id, category_id, status, certification_method, rating, last_verified_at) VALUES
    ('zero-maida-rusk',  'Zero Maida Rusk', (SELECT id FROM public.brands WHERE slug='the-health-factory'), c_rusks, 'Live', 'label_tested', 'A',  now()),
    ('millet-rusk',      'Millet Rusk',     (SELECT id FROM public.brands WHERE slug='early-foods'),         c_rusks, 'Live', 'label_tested', 'A',  now())
  ON CONFLICT (slug) DO NOTHING;

  -- Biscuits
  INSERT INTO public.products (slug, name, brand_id, category_id, status, certification_method, rating, last_verified_at) VALUES
    ('millet-jaggery-cookies',  'Millet Jaggery Cookies',  (SELECT id FROM public.brands WHERE slug='early-foods'), c_biscuits, 'Live', 'label_tested', 'A', now()),
    ('millet-chocolate-chip',   'Millet Chocolate Chip',   (SELECT id FROM public.brands WHERE slug='kikibix'),     c_biscuits, 'Live', 'label_tested', 'A', now())
  ON CONFLICT (slug) DO NOTHING;

  -- Noodles
  INSERT INTO public.products (slug, name, brand_id, category_id, status, certification_method, rating, last_verified_at) VALUES
    ('wheat-noodles-little-moppet', 'Wheat Noodles',  (SELECT id FROM public.brands WHERE slug='little-moppet-foods'), c_noodles, 'Live', 'label_tested', 'A', now()),
    ('quinoa-noodles-naturally',    'Quinoa Noodles', (SELECT id FROM public.brands WHERE slug='naturally-yours'),     c_noodles, 'Live', 'label_tested', 'A', now())
  ON CONFLICT (slug) DO NOTHING;

  -- Peanut Butter
  INSERT INTO public.products (slug, name, brand_id, category_id, status, certification_method, rating, last_verified_at) VALUES
    ('pintola-crunchy-pb',           'Peanut Butter Crunchy',         (SELECT id FROM public.brands WHERE slug='pintola'),     c_pb, 'Draft', 'label_tested', 'A',  now()),
    ('myfitness-crunchy-pb',         'Peanut Butter Crunchy',         (SELECT id FROM public.brands WHERE slug='myfitness'),   c_pb, 'Live',  'label_tested', 'A',  now()),
    ('pintola-high-protein-pb',      'High Protein Peanut Butter',    (SELECT id FROM public.brands WHERE slug='pintola'),     c_pb, 'Draft', 'label_tested', 'A+', now()),
    ('nut-roasters-crunchy-pb',      'Crunchy Peanut Butter',         (SELECT id FROM public.brands WHERE slug='nut-roasters'),c_pb, 'Live',  'label_tested', 'A+', now())
  ON CONFLICT (slug) DO NOTHING;

  -- Paneer (lab-tested via Eurofins)
  INSERT INTO public.products (slug, name, brand_id, category_id, status, certification_method, rating, last_verified_at) VALUES
    ('amul-fresh-paneer',            'Fresh Paneer',           (SELECT id FROM public.brands WHERE slug='amul'),        c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('amul-malai-paneer',            'Malai Fresh Paneer',     (SELECT id FROM public.brands WHERE slug='amul'),        c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('gowardhan-paneer',             'Paneer',                 (SELECT id FROM public.brands WHERE slug='gowardhan'),   c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('humpy-a2-paneer',              'A2 Paneer',              (SELECT id FROM public.brands WHERE slug='humpy'),       c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('desi-farms-low-fat-paneer',    'Low Fat Paneer',         (SELECT id FROM public.brands WHERE slug='desi-farms'),  c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('id-fresh-high-protein-paneer', 'High Protein Paneer',    (SELECT id FROM public.brands WHERE slug='id-fresh'),    c_paneer, 'Live', 'lab_tested', 'A+', now()),
    ('milky-mist-high-protein-paneer','High Protein Paneer',   (SELECT id FROM public.brands WHERE slug='milky-mist'),  c_paneer, 'Live', 'lab_tested', 'A+', now())
  ON CONFLICT (slug) DO NOTHING;
END $$;
```

**Steps:**
- [ ] Apply via SQL Editor in dashboard (the seed file lives in repo for documentation but cloud apply uses dashboard SQL)
- [ ] Verify counts: rusks=2, biscuits=2, noodles=2, peanut-butter=2 Live (+2 Draft), paneer=7 = **15 Live + 2 Draft**
- [ ] Commit the seed SQL file

---

## Task 3: Service-role admin client + queries lib

**Files:** `lib/supabase/admin.ts`, `lib/products/queries.ts`

`lib/supabase/admin.ts`:
```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

`lib/products/queries.ts`:
```ts
import { createClient } from '@/lib/supabase/server';

export async function getLiveCountByCategory() {
  const sb = await createClient();
  const { data, error } = await sb
    .from('products')
    .select('category_id', { count: 'exact', head: false })
    .eq('status', 'Live');
  if (error) throw error;
  const counts = new Map<number, number>();
  for (const row of data ?? []) {
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }
  return counts;
}

export async function getLiveProductsForCategory(categorySlug: string) {
  const sb = await createClient();
  const { data, error } = await sb
    .from('products')
    .select(`
      id, slug, name, variant_size, rating, certification_method,
      product_photo_url, label_image_url, primary_buy_url, last_verified_at,
      brand:brands ( slug, name ),
      category:categories!inner ( slug, name )
    `)
    .eq('status', 'Live')
    .eq('category.slug', categorySlug)
    .order('rating', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getLiveProductBySlug(categorySlug: string, productSlug: string) {
  const sb = await createClient();
  const { data, error } = await sb
    .from('products')
    .select(`
      *,
      brand:brands ( slug, name, website_url ),
      category:categories!inner ( slug, name, blurb )
    `)
    .eq('status', 'Live')
    .eq('slug', productSlug)
    .eq('category.slug', categorySlug)
    .single();
  if (error) return null;
  return data;
}
```

**Steps:**
- [ ] Write both files
- [ ] `npx tsc --noEmit` to verify type-check
- [ ] Commit: `feat: add admin Supabase client + product query helpers`

---

## Task 4: Homepage shows live counts per category

Modify `app/page.tsx`:
- Import `getLiveCountByCategory`
- Pass count into category cards: `"{n} approved"` under each category name

**Steps:**
- [ ] Update `app/page.tsx` to call `getLiveCountByCategory` and render counts
- [ ] Build, verify locally, commit: `feat: show approved counts on homepage`

---

## Task 5: Public category page `/c/[category]`

**File:** `app/c/[category]/page.tsx`

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLiveProductsForCategory } from '@/lib/products/queries';

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const sb = await createClient();
  const { data: cat } = await sb
    .from('categories')
    .select('slug, name, blurb')
    .eq('slug', slug)
    .eq('active', true)
    .single();
  if (!cat) notFound();

  const products = await getLiveProductsForCategory(slug);

  return (
    <main className="max-w-[1280px] mx-auto px-6 sm:px-10 py-16">
      <Link href="/" className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)] hover:text-[color:var(--accent-deep)]">
        ← All categories
      </Link>
      <h1 className="font-display text-5xl sm:text-6xl tracking-tight mt-6">{cat.name}</h1>
      <p className="text-[color:var(--ink-soft)] text-lg max-w-2xl mt-3">{cat.blurb}</p>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/c/${slug}/${p.slug}`}
            className="bg-[color:var(--bg-elev)] border rule rounded-sm p-6 hover:border-[color:var(--ink)] transition-colors block"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
              {Array.isArray(p.brand) ? p.brand[0]?.name : p.brand?.name}
            </p>
            <h3 className="font-display text-2xl tracking-tight mt-2">{p.name}</h3>
            {p.variant_size && (
              <p className="text-sm text-[color:var(--ink-soft)] mt-1">{p.variant_size}</p>
            )}
            <div className="mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em]">
              <span className={p.certification_method === 'lab_tested' ? 'text-[color:var(--lab)]' : 'text-[color:var(--ink-mute)]'}>
                {p.certification_method === 'lab_tested' ? 'Lab-verified ✓' : 'Label-tested'}
              </span>
              <span className="text-[color:var(--ink-mute)]">View →</span>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-12 text-[color:var(--ink-soft)]">No approved products in this category yet.</p>
      )}
    </main>
  );
}
```

**Steps:**
- [ ] Write the file
- [ ] Build, smoke-test all 5 categories load locally
- [ ] Commit: `feat: public category landing pages`

---

## Task 6: Public product detail page `/c/[category]/[slug]`

**File:** `app/c/[category]/[slug]/page.tsx`

Minimum-viable detail: brand + name + variant + verdict badge + cert method + buy link + last verified. (Photos, label image, source citation, "why it passes" rule grid all come in Plan 5.)

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLiveProductBySlug } from '@/lib/products/queries';

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const product = await getLiveProductBySlug(category, slug);
  if (!product) notFound();

  const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand;
  const cat = Array.isArray(product.category) ? product.category[0] : product.category;
  const isLab = product.certification_method === 'lab_tested';
  const verifiedDate = product.last_verified_at
    ? new Date(product.last_verified_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <main className="max-w-[900px] mx-auto px-6 sm:px-10 py-16">
      <nav className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
        <Link href={`/c/${category}`} className="hover:text-[color:var(--accent-deep)]">
          ← {cat?.name}
        </Link>
      </nav>

      <header className="mt-8 pb-8 border-b rule">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">{brand?.name}</p>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight mt-3">{product.name}</h1>
        {product.variant_size && (
          <p className="text-lg text-[color:var(--ink-soft)] mt-2">{product.variant_size}</p>
        )}
      </header>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-2">Verdict</div>
          <div className="font-display text-xl">Food Pharmer Approved</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-2">Certification</div>
          <div className={`font-display text-xl ${isLab ? 'text-[color:var(--lab)]' : ''}`}>
            {isLab ? 'Lab-verified ✓' : 'Label-tested'}
          </div>
          {!isLab && (
            <p className="text-xs text-[color:var(--ink-mute)] mt-1">Verified from product label, not chemical analysis.</p>
          )}
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-2">Last verified</div>
          <div className="font-display text-xl">{verifiedDate ?? '—'}</div>
        </div>
      </section>

      {product.primary_buy_url && (
        <a
          href={product.primary_buy_url}
          target="_blank"
          rel="noopener"
          className="mt-10 inline-flex items-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-5 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors"
        >
          Where to buy →
        </a>
      )}

      {product.ingredients_raw && (
        <section className="mt-12 border-t rule pt-8">
          <h2 className="font-display text-2xl tracking-tight">Ingredients</h2>
          <p className="text-[color:var(--ink-soft)] mt-3 leading-relaxed">{product.ingredients_raw}</p>
        </section>
      )}

      <footer className="mt-16 pt-8 border-t rule text-xs text-[color:var(--ink-mute)] font-mono uppercase tracking-[0.22em]">
        Re-verified every 6 months · brands change formulations · <Link href="/contact" className="underline">found an error?</Link>
      </footer>
    </main>
  );
}
```

**Steps:**
- [ ] Write the file
- [ ] Build + smoke-test a few product URLs locally
- [ ] Commit: `feat: minimal public product detail page`

---

## Task 7: Admin product list `/admin/products`

**File:** `app/(admin)/admin/products/page.tsx`

Server component, table view, filter by category + status via search params.

```tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

type SP = { category?: string; status?: string };

export default async function AdminProductsList({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const sb = await createClient();
  let q = sb
    .from('products')
    .select(`
      id, slug, name, status, rating, certification_method, updated_at,
      brand:brands(name, slug),
      category:categories(name, slug)
    `)
    .order('updated_at', { ascending: false });
  if (sp.status) q = q.eq('status', sp.status as any);

  const { data: products, error } = await q;
  const filtered = sp.category
    ? (products ?? []).filter((p) => {
        const c = Array.isArray(p.category) ? p.category[0] : p.category;
        return c?.slug === sp.category;
      })
    : (products ?? []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products ({filtered.length})</h1>
        <Link href="/admin/products/new" className="bg-black text-white px-4 py-2 text-sm">+ New product</Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error.message}</p>}

      <FiltersBar current={sp} />

      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-gray-500 border-b">
          <tr>
            <th className="py-2">Product</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Cert</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => {
            const b = Array.isArray(p.brand) ? p.brand[0] : p.brand;
            const c = Array.isArray(p.category) ? p.category[0] : p.category;
            return (
              <tr key={p.id} className="border-b hover:bg-stone-50">
                <td className="py-2 font-medium">{p.name}</td>
                <td className="text-gray-600">{b?.name}</td>
                <td className="text-gray-600">{c?.name}</td>
                <td><StatusPill status={p.status} /></td>
                <td>{p.rating ?? '—'}</td>
                <td className="text-xs">{p.certification_method.replace('_', ' ')}</td>
                <td className="text-xs text-gray-500">{new Date(p.updated_at).toLocaleDateString()}</td>
                <td><Link href={`/admin/products/${p.id}`} className="underline">edit</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FiltersBar({ current }: { current: SP }) {
  const statuses = ['Draft', 'PendingReview', 'Approved', 'Live', 'Rejected', 'Retracted'];
  return (
    <div className="mb-4 flex gap-2 text-xs">
      <Link href="/admin/products" className={!current.status && !current.category ? 'underline font-bold' : 'underline'}>all</Link>
      {statuses.map((s) => (
        <Link key={s} href={`/admin/products?status=${s}`} className={current.status === s ? 'underline font-bold' : 'underline'}>{s}</Link>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'Live' ? 'bg-green-100 text-green-800' :
    status === 'Approved' ? 'bg-blue-100 text-blue-800' :
    status === 'PendingReview' ? 'bg-amber-100 text-amber-800' :
    status === 'Rejected' || status === 'Retracted' ? 'bg-red-100 text-red-800' :
    'bg-stone-100 text-stone-800';
  return <span className={`px-2 py-0.5 text-xs ${tone}`}>{status}</span>;
}
```

**Steps:**
- [ ] Write the file
- [ ] Smoke-test at `/admin/products` locally
- [ ] Commit: `feat(admin): product list with filters`

---

## Task 8: Admin create + edit forms

**Files:**
- `app/(admin)/admin/products/_actions.ts` — server actions (create, update, delete)
- `app/(admin)/admin/products/_form.tsx` — shared form (used by /new and /[id])
- `app/(admin)/admin/products/new/page.tsx`
- `app/(admin)/admin/products/[id]/page.tsx`

The form covers: slug, name, brand_id (select), category_id (select), variant_size, status, certification_method, rating, ingredients_raw, primary_buy_url, last_verified_at, product_photo_url, label_image_url. Image fields are URL inputs for now (file upload comes in Plan 4).

Server actions use the admin (service-role) client for writes, with a session check up front:

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const sb = await createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

export async function createProduct(formData: FormData) {
  const user = await requireAdmin();
  const admin = createAdminClient();
  const payload = formToPayload(formData, user.id);
  const { data, error } = await admin.from('products').insert(payload).select('id').single();
  if (error) throw error;
  revalidatePath('/admin/products');
  redirect(`/admin/products/${data.id}`);
}

export async function updateProduct(id: number, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const payload = formToPayload(formData);
  const { error } = await admin.from('products').update(payload).eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

function formToPayload(fd: FormData, preparedBy?: string) {
  const get = (k: string) => {
    const v = fd.get(k);
    return v === null || v === '' ? null : String(v);
  };
  const num = (k: string) => {
    const v = get(k);
    return v === null ? null : Number(v);
  };
  return {
    slug: get('slug')!,
    name: get('name')!,
    brand_id: num('brand_id')!,
    category_id: num('category_id')!,
    variant_size: get('variant_size'),
    status: get('status') as any,
    certification_method: get('certification_method') as any,
    rating: get('rating') as any,
    ingredients_raw: get('ingredients_raw'),
    primary_buy_url: get('primary_buy_url'),
    product_photo_url: get('product_photo_url'),
    label_image_url: get('label_image_url'),
    last_verified_at: get('last_verified_at'),
    ...(preparedBy ? { prepared_by: preparedBy, prepared_at: new Date().toISOString() } : {}),
  };
}
```

The form component is a server component that hydrates select options for brands and categories from the DB, then renders an HTML form with `action={createProduct}` or `action={updateProduct.bind(null, id)}`.

**Steps:**
- [ ] Write `_actions.ts`
- [ ] Write `_form.tsx` (shared form)
- [ ] Write `new/page.tsx` (renders form with no defaults)
- [ ] Write `[id]/page.tsx` (fetches product, renders form with defaults + delete button)
- [ ] Build, smoke-test creating a Draft product locally
- [ ] Commit: `feat(admin): product create + edit forms with server actions`

---

## Task 9: RLS smoke test for products

**File:** `tests/rls/products-rls.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

describe('products RLS', () => {
  it('anon sees only Live products', async () => {
    const sb = createClient(url, anon);
    const { data, error } = await sb.from('products').select('slug, status');
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
    for (const p of data!) {
      expect(p.status).toBe('Live');
    }
  });

  it('anon cannot insert', async () => {
    const sb = createClient(url, anon);
    const { error } = await sb.from('products').insert({
      slug: 'evil', name: 'Evil', brand_id: 1, category_id: 1, status: 'Live',
    } as any);
    expect(error).not.toBeNull();
  });

  it('Pintola products are not Live (brand exclusion pending)', async () => {
    const sb = createClient(url, anon);
    const { data } = await sb.from('products').select('slug').like('slug', 'pintola-%');
    expect(data!.length).toBe(0);
  });
});
```

**Steps:**
- [ ] Write the test
- [ ] `npm test` → expect 5 tests pass (2 from categories + 3 here)
- [ ] Commit: `test(rls): products live-only + insert-deny + pintola-pending`

---

## Task 10: Deploy

**Steps:**
- [ ] Push to `master` (already auto-pushes to GitHub from prior commits)
- [ ] `vercel deploy --prod --yes --token $VERCEL_TOKEN`
- [ ] Smoke-test live: `/`, `/c/paneer`, `/c/paneer/amul-fresh-paneer`, `/admin/products`
- [ ] Commit any final fixes

---

## Done state

- 17 products in DB (15 Live, 2 Pintola Draft pending brand-exclusion review)
- Public homepage shows count per category
- `/c/[category]` lists all Live products in that category
- `/c/[category]/[slug]` shows minimal product detail (brand, name, verdict, cert method, last verified, ingredients, buy link)
- `/admin/products` list with status filters
- `/admin/products/new` and `/admin/products/[id]` create/edit forms
- RLS: anon sees only Live, anon writes blocked, Pintola products hidden until brand-exclusion review

Ready for **Plan 3: Approval workflow** (Revant's queue + state machine + audit log).
