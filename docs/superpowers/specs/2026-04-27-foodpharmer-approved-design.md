# Food Pharmer Approved — Design Spec

**Date:** 2026-04-27
**Author:** Dev (with Claude)
**Status:** Draft — pending review
**Target launch:** v1, tight scope, hand-curated

---

## 1. Purpose

Public catalog of packaged-food products that meet Food Pharmer's clean-label criteria, backed by a curated approval workflow with a defensible audit trail. Each approved product is paired with the original ingredient label and a citation to the source page where ingredients were verified.

**Audience:** dual — FP's existing IG followers (3.2M) and search-driven discovery (consumers Googling "best biscuit no maida" etc.). Both surfaces matter equally; the URL structure and product pages are SEO-optimised, the visual design is brand-led for IG referrals.

**Why now:** Revant's IG content compares products informally (carousels, reels). FP-Approved gives those approvals a permanent, searchable home with a citation trail.

**Out of scope for v1:** public-facing verifier (paste-any-URL → verdict), AI-driven label-finder, restaurants module (Burma Burma plan), affiliate revenue, multi-language UI.

---

## 2. Constraints & non-negotiables

| # | Constraint | Implication |
|---|---|---|
| C1 | **Zero tolerance for false claims.** Site is public, brand reputation on the line. | Every product requires human approval. Rules engine is advisory, never auto-approves. Per-approval evidence (URL + screenshot + raw HTML + SHA256 + retrieval timestamp) is captured in `source_snapshots`. |
| C2 | **Brand-level exclusion of OWN competitors** — any brand that makes whey / protein / milk-mix is blacklisted, even if their other products would otherwise pass. | `brands.is_excluded` flag + admin warning before submit. |
| C3 | **Revant signs off every product**, but his time is precious. | Two-step flow: Dev preps, Revant gets a mobile-friendly approval queue (~30s per product). |
| C4 | **Streamlit Cloud free slot is occupied** (by OWN reviews hub). | Cannot host on Streamlit. Stack chosen accordingly. |
| C5 | **Lab testing only happens for paneer** at launch (Eurofins reports already in hand). All other categories are label-tested with explicit disclosure. | `certification_method` enum supports both; UI shows "Lab-verified ✓" badge only for paneer. |
| C6 | **Re-verification every 6 months** per product (12 months for lab-tested paneer). | Daily cron flags due products; re-scrape and re-submit. |
| C7 | **Hidden Not-Approved products** — only Approved-Live products are visible publicly. The "comparison roast" angle is deferred. | Public `SELECT` is gated on `status='Live'` via Postgres RLS. |

---

## 3. Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  PUBLIC SITE — Next.js SSG/ISR on Vercel                         │
│  foodpharmerapproved.com (later); *.vercel.app (launch)          │
│   /                       home, hero, category tiles             │
│   /c/[category]           category landing + criteria block      │
│   /c/[category]/[slug]    product detail (photo, label, verdict) │
│   /search                 client-side fuzzy across approved      │
│   /method                 editorial: rules + how we approve      │
│   /about, /contact                                                │
└──────────────────────────────────────────────────────────────────┘
                              ↑ build-time + ISR
┌──────────────────────────────────────────────────────────────────┐
│  SUPABASE — Postgres + Auth + Storage + RLS                      │
│   tables: brands, categories, category_rules, products,          │
│           product_rule_results, source_snapshots, audit_log,     │
│           brand_exclusions                                        │
│   storage buckets: product-photos, label-images, source-screens, │
│                    lab-reports                                    │
└──────────────────────────────────────────────────────────────────┘
                              ↑ auth-gated writes
┌──────────────────────────────────────────────────────────────────┐
│  ADMIN — same Next.js app, /admin/* gated by Supabase Auth        │
│   /admin/queue            Dev's prep queue (paste URL → scrape)  │
│   /admin/products         CRUD + retract                          │
│   /admin/approvals        Revant's mobile approval cards          │
│   /admin/brands           brand exclusion list                    │
│   /admin/rules            edit category_rules without deploy     │
│   /admin/audit            append-only event log                  │
└──────────────────────────────────────────────────────────────────┘
                              ↑ calls
┌──────────────────────────────────────────────────────────────────┐
│  SCRAPER — Next.js API route (Playwright on Vercel/Edge fallback) │
│   POST /api/scrape  { url } → { html, ingredients_text,           │
│                                 product_image_url,                │
│                                 label_image_url,                  │
│                                 screenshot_blob, retrieved_at,    │
│                                 hash_sha256 }                     │
│   Targeted parsers per source: amazon.in, blinkit.com, zepto.com, │
│   bigbasket.com, brand-site fallback (readability + OCR for       │
│   image-only labels via Tesseract or cloud OCR).                  │
└──────────────────────────────────────────────────────────────────┘
```

**Roles**

- **Public** — anonymous, read-only, sees only `status='Live'` rows
- **Dev (admin)** — preps every product, runs scraper, fills fields, submits to Revant, retracts
- **Revant (approver)** — sees only approval queue; can Approve / Reject / Ask. Cannot edit fields.
- **Auditor (future)** — read-only across all tables for legal/PR review

**Stack rationale**

- **Next.js + Vercel:** SSG/ISR gives fast SEO and IG-referral pages; ISR auto-regenerates within ~10s of an approval via Supabase webhook → Vercel revalidation, no manual deploys.
- **Supabase:** Postgres + Auth + Storage + RLS in one. Free tier covers v1 traffic. Built-in audit-log via `pg_audit` extension if needed.
- **Single app for public + admin:** simpler ops, one deploy, shared types/components. Admin pages bundled separately to keep public bundle thin.

---

## 4. Data model

```sql
-- ============== TAXONOMY ==============
CREATE TABLE categories (
  id              SERIAL PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  serving_size_g  INT,
  serving_label   TEXT,
  blurb           TEXT,
  display_order   INT DEFAULT 100,
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE category_rules (
  id              SERIAL PRIMARY KEY,
  category_id     INT REFERENCES categories(id),   -- NULL = universal
  code            TEXT NOT NULL,
  description     TEXT NOT NULL,
  evaluator_kind  TEXT NOT NULL,                   -- boolean | threshold_lt | threshold_gt | regex_absent | manual
  threshold_value NUMERIC,
  threshold_unit  TEXT,                            -- 'g_per_100g', 'mg_per_100g', etc.
  is_required     BOOLEAN DEFAULT true,
  display_order   INT DEFAULT 100,
  active          BOOLEAN DEFAULT true
);

-- ============== BRANDS ==============
CREATE TABLE brands (
  id              SERIAL PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  website_url     TEXT,
  is_excluded     BOOLEAN DEFAULT false,
  exclusion_reason TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============== PRODUCTS ==============
CREATE TYPE product_status AS ENUM (
  'Draft', 'PendingReview', 'NeedsClarification',
  'Approved', 'Rejected', 'Live', 'Retracted'
);

CREATE TYPE certification_method AS ENUM ('label_tested', 'lab_tested', 'both');

CREATE TYPE product_rating AS ENUM ('A+', 'A', 'B+', 'B', 'C', 'D');

CREATE TABLE products (
  id              SERIAL PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  brand_id        INT REFERENCES brands(id),
  category_id     INT REFERENCES categories(id),
  variant_size    TEXT,
  description_md  TEXT,
  status          product_status DEFAULT 'Draft',
  certification_method certification_method DEFAULT 'label_tested',
  rating          product_rating,
  verdict         TEXT GENERATED ALWAYS AS (
                    CASE WHEN rating IN ('A+','A') THEN 'Approved'
                         ELSE 'Not Approved' END) STORED,

  product_photo_url    TEXT,
  label_image_url      TEXT,                       -- REQUIRED for Live
  ingredient_image_url TEXT,

  ingredients_raw      TEXT,
  ingredients_parsed   JSONB,                      -- best-effort, often partial
  nutrition            JSONB,                      -- {sugar_g_per_100g: 18, ...}
  contains_flags       JSONB,                      -- {has_maida:false, ...}

  primary_buy_url      TEXT,
  alt_buy_urls         JSONB,                      -- [{label, url}]

  prepared_by          UUID REFERENCES auth.users(id),
  prepared_at          TIMESTAMPTZ,
  reviewed_by          UUID REFERENCES auth.users(id),
  reviewed_at          TIMESTAMPTZ,
  review_notes         TEXT,

  last_verified_at     TIMESTAMPTZ,
  reverify_due_at      TIMESTAMPTZ,
  retracted_at         TIMESTAMPTZ,
  retraction_reason    TEXT,

  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON products(status, category_id);
CREATE INDEX ON products(reverify_due_at) WHERE status = 'Live';

-- Per-product rule evaluation results (computed at submit, frozen at approval)
CREATE TABLE product_rule_results (
  product_id    INT REFERENCES products(id) ON DELETE CASCADE,
  rule_id       INT REFERENCES category_rules(id),
  passed        BOOLEAN NOT NULL,
  observed      JSONB,                             -- {value, unit, field}
  evaluated_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (product_id, rule_id)
);

-- ============== AUDIT / EVIDENCE ==============
-- Snapshot of source page at time of approval. Defensive trail for the
-- 1%-error promise: if a brand changes labels or sues, we have proof.
CREATE TABLE source_snapshots (
  id              SERIAL PRIMARY KEY,
  product_id      INT REFERENCES products(id) ON DELETE CASCADE,
  source_url      TEXT NOT NULL,
  source_domain   TEXT,
  retrieved_at    TIMESTAMPTZ DEFAULT now(),
  screenshot_url  TEXT,
  raw_html_url    TEXT,
  extracted_text  TEXT,
  hash_sha256     TEXT,
  lab_report_url  TEXT                             -- paneer / future lab tests
);

CREATE TABLE audit_log (
  id              BIGSERIAL PRIMARY KEY,
  product_id      INT REFERENCES products(id),
  actor_user_id   UUID REFERENCES auth.users(id),
  action          TEXT NOT NULL,                   -- prep, submit, approve, reject, ask, retract, reverify
  from_status     product_status,
  to_status       product_status,
  diff            JSONB,
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Public can SELECT only Live products. Anonymous never sees Drafts/Pending/Rejected.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_live_only ON products
  FOR SELECT USING (status = 'Live');
```

**Schema notes**

- `verdict` is a generated column from `rating`. Single source of truth — `rating` is set during prep/approval, `verdict` is derived.
- Approved-but-not-Live exists as a buffer state. Status moves Approved → Live via manual button in admin (gives Dev/Revant a pre-publish review beat).
- `category_rules` covers BOTH the per-category criteria (rows with `category_id` set) AND the universal 8 rules (rows with `category_id IS NULL`). One table, no duplication.
- `contains_flags` and `nutrition` are JSONB to allow new fields without migrations.
- `last_verified_at` is updated by every successful re-verification scrape.
- `source_snapshots` is append-only; never UPDATE or DELETE rows.

---

## 5. Categories & rules at launch

**5 categories from seed data** (`docs.google.com/spreadsheets/d/1B-p32X...`):

| Category | Per-category criteria (`category_rules` rows) |
|---|---|
| **Rusks** | Wholegrains only (no maida); no artificial colors; <15g added sugar/100g; ≥9g fibre/100g; ≥10g protein/100g |
| **Biscuits** | Wholegrains; no artificial colors; <20g added sugar/100g; ≥5g fibre/100g |
| **Noodles** | Noodles contain only wholegrain flour, salt, oil; spice mix only powdered spices/herbs/salt; sodium <100mg/100g |
| **Paneer** | Only milk (or solids) + acidic agent (lime / citric / vinegar). **Lab-tested** via Eurofins. |
| **Peanut Butter** | 100% peanuts (or peanuts + whey); no sugar/salt/oil; ≥25g protein/100g |

**Universal 8 rules (`category_id IS NULL`)** — applied to all products as marketing/framing:
1. No maida · 2. No more than 10% sugar (per 100g; framing rule, hard threshold lives in category_rules) · 3. No palm oil · 4. No artificial sweeteners · 5. No artificial colors · 6. No thickeners · 7. No artificial flavours · 8. No maltodextrin

**Approved products at launch (~17 from seed):**
- Rusks: Zero Maida Rusk (Health Factory), Millet Rusk (Early Foods)
- Biscuits: Millet Jaggery Cookies (Early Foods), Millet Chocolate Chip (Kikibix)
- Noodles: Wheat Noodles (Little Moppet), Quinoa Noodles (Naturally Yours)
- Peanut Butter: Pintola Crunchy ⚠️ (verify Pintola doesn't make whey before approving), Myfitness Crunchy, Pintola High Protein A+, Nut Roasters Crunchy A+
- Paneer: Amul Fresh, Amul Malai, Gowardhan, Humpy A2, Desi Farms, ID Fresh, Milky Mist (all lab-tested)

**Rules engine layered evaluation:**
1. **Universal** rules (`category_id IS NULL`)
2. **Category-specific** rules (`category_id = X`)
3. **Product-specific overrides** (future — column on `products` not yet modeled; add on demand)

Each rule's `evaluator_kind` determines how it's checked:

| Kind | Reads from | Example |
|---|---|---|
| `boolean` | `product.contains_flags[code]` | `has_maida = false` ⇒ ✓ |
| `threshold_lt` | `product.nutrition` | sugar < 20 g/100g |
| `threshold_gt` | `product.nutrition` | protein ≥ 25 g/100g |
| `regex_absent` | `product.ingredients_raw` | regex doesn't match `palm oil` |
| `manual` | Dev/Revant attestation | "Lab report shows pure milk" ✓ |

**The engine produces suggestions, never decisions.** Three layers of human gate: Dev review of each rule result → Revant approval of submission → public flag-an-error path via /contact.

---

## 6. Workflows

### 6.1 Ingestion (Dev)

```
Paste URL → POST /api/scrape → preview side-by-side with editable form
  → fill brand, category, ingredients_raw, nutrition, contains_flags,
    photo crop, label image crop, primary_buy_url
  → live rules check (re-runs on every field change)
  → brand-on-watch warning if brand matches OWN exclusion list
  → "Submit to Revant" — gated on:
      ✓ ingredients_raw filled
      ✓ label_image_url set
      ✓ source_url captured
      ✓ all is_required rules passing OR Dev override + note
  → status: Draft → PendingReview
  → notification email to Revant (digest, daily at 09:00 IST)
```

### 6.2 Approval (Revant)

```
Mobile-first /admin/approvals card view (Supabase magic-link auth)
  → product photo, label image (lightbox), ingredients (Dev's transcription),
    each rule ✓/✗ with observed values, source domain badge, Dev's note
  → three actions:
      [Approve] → status=Approved, reviewed_by/at set
      [Ask]     → status=NeedsClarification + comment, returns to Dev
      [Reject]  → status=Rejected (terminal)
```

### 6.3 Publish

```
Approved → "Push Live" button (Dev) → status=Live
  → Supabase webhook fires
  → Vercel ISR revalidates affected paths (/c/[category], /c/[category]/[slug], /)
  → public site updates within ~10s
  → audit_log row written
```

### 6.4 Re-verification

```
Daily cron (Vercel Cron) at 02:00 IST:
  → SELECT products WHERE status='Live' AND reverify_due_at < now()
  → Email Dev a digest
  → Dev opens admin, hits "Re-verify" → fresh scrape
  → Diff vs last source_snapshot:
      No drift → last_verified_at = now(), reverify_due_at = +6mo, no review needed
      Drift detected (ingredients_raw or contains_flags changed) → status=PendingReview
  → New source_snapshot row written either way
```

### 6.5 Retract (kill-switch)

```
From any admin product page → [Retract] → confirm dialog with reason field
  → status=Retracted, retracted_at=now(), retraction_reason set
  → Vercel revalidate /c/[category]/[slug] returns 410 Gone within ~10s
  → CDN purge for that path
  → public site links removed from /c/[category], /search, /
  → audit_log row
```

### 6.6 State machine

```
Draft → PendingReview ⇄ NeedsClarification → Approved → Live → Retracted
                    ↓
                 Rejected (terminal)
```

---

## 7. Public site — page-by-page

### 7.1 Home (`/`)

- Hero: "Products Food Pharmer would actually buy" + 1-line method explainer + [How we approve] CTA
- 5 category tiles (Rusks / Biscuits / Noodles / Paneer / Peanut Butter), each with count: "8 approved · 22 reviewed"
- "Newest approvals" rail (last 6, by `reviewed_at`)
- "What we look for" — universal 8 rules in plain Hindi+English
- Footer: /method · /about · /contact · IG link

### 7.2 Category (`/c/[category]`)

- Category headline + criteria block (per-category rules, public-facing)
- Approved grid (only `status='Live'` in this category)
  - Card: photo · brand · name · variant · [View label]
- Filters: lab-tested only, brand
- **No "Reviewed but not approved" section in v1** (deferred per scope decision)

### 7.3 Product (`/c/[category]/[slug]`)

- Hero block:
  - Product photo (left, large)
  - Right column:
    - Brand — Product name — Variant
    - Category breadcrumb
    - **"Food Pharmer Approved"** badge + verification line: *"Verified from amazon.in on Apr 27, 2026"*
    - Certification: "Label-tested" (with disclosure "Verified from product label, not chemical analysis") OR "Lab-verified ✓ Eurofins" (paneer)
    - [Where to buy] primary buy URL
    - [View nutrition label] → opens label_image lightbox
- "Why it passes" block — per-category rules with ✓ + observed values inline
  - Example: ✓ Minimum 25g protein per 100g — *28g*
- Ingredients block (verbatim, as printed on pack)
- Nutrition label image (large, zoomable)
- Source citation (collapsed by default):
  > "We verified ingredients from `{source_url}` on `{retrieved_at}`. Brands change formulations — we re-verify every 6 months. Found an error? [Contact us]."
- Last verified · Reverify due
- (v2) Similar approved products

### 7.4 Other pages

- `/search` — client-side fuzzy across name/brand, Approved-Live only
- `/method` — editorial: rules + approval process + re-verification policy + contact-us-if-wrong
- `/about` — what FP-Approved is, why it exists, team
- `/contact` — form → Supabase row → Dev's email
- (v2 placeholders) `/verify` (paste-URL verifier), `/restaurants` (Burma Burma)

---

## 8. Admin UI

### 8.1 Dev's prep workspace — `/admin/queue` (desktop-first)

- URL paste → scraper preview (screenshot side-by-side with extracted text)
- Editable fields: brand (with on-watch warning if exclusion list match), name, category, variant, photo, label image, buy URL, certification method, suggested rating
- Live rules check panel: every rule with ✓/✗ and observed value
- Brand-on-watch: yellow banner if brand fuzzy-matches OWN-competitor exclusion list; Dev must tick "verified brand doesn't make protein powder" before submit
- Notes-for-Revant text area
- [Save draft] [Submit to Revant ▶] (Submit gated as in §6.1)

### 8.2 Revant's approval queue — `/admin/approvals` (mobile-first)

- Card view, swipeable, large tap targets
- Per card: product photo, brand+name+variant+category, "✓ All N rules pass" line, suggested rating, source domain badge, label image preview, Dev's note
- Three buttons: [Approve] [Ask] [Reject]
- No editing — only state transitions
- Login: Supabase Auth magic-link to email; one tap, no password

### 8.3 Other admin pages

- `/admin/products` — table view, filter by status/category/brand, bulk actions (retract, force re-verify), export to CSV
- `/admin/brands` — manage brands + OWN-competitor exclusion list (CRUD)
- `/admin/rules` — edit `category_rules` (add/edit/disable rules without code deploy)
- `/admin/audit` — append-only log, filter by actor / product / date / action

---

## 9. Permissions & RLS

| Role | products | source_snapshots | audit_log | brands / rules |
|---|---|---|---|---|
| Public (anonymous) | SELECT WHERE status='Live' | (none) | (none) | (none) |
| Dev | full CRUD via service-role API | INSERT (auto by scraper) | INSERT (auto by triggers) | full CRUD |
| Revant | SELECT all; UPDATE only `status`, `review_notes`, `reviewed_at`, `reviewed_by` | SELECT for review | SELECT all | SELECT |
| Auditor (future) | SELECT all | SELECT all | SELECT all | SELECT all |

Service-role key never sent to browser; admin writes go through Next.js API routes that check Supabase Auth session + role.

---

## 10. Defensive layer (the 1% promise)

- **Per-approval evidence** captured immutably in `source_snapshots`: source_url, screenshot, raw HTML, extracted text, SHA256 hash, retrieval timestamp. Lab report PDF for paneer (5-year retention).
- **Footer disclosure** on every product page: *"Ingredients verified from {source_url} on {retrieved_at}. Brands occasionally change formulations; we re-verify every 6 months. Found an error? [Contact us]."*
- **Re-verification cadence:** 6 months default (12 months for lab-tested paneer). Daily cron flags due products.
- **Kill-switch:** one-click Retract → 410 Gone within ~10s. Slug never auto-redirects to a different product (avoids "bait and switch" risk).
- **Rule-edit safety:** edits to `category_rules` don't retroactively flip existing approvals. Re-evaluation happens only at next re-verification or manual re-run.
- **Brand-exclusion override audit:** if Dev unticks the on-watch warning, the override is logged in `audit_log` with the reason. Revant sees it on the approval card.

---

## 11. Out-of-scope for v1

| Feature | Status | Why deferred |
|---|---|---|
| Public verifier (paste URL → verdict) | v2 | "another day, later update" |
| AI label-finder agent | v2 | URL-paste workflow sufficient for tight launch |
| Restaurants module (Burma Burma) | v2 | Schema-aware; UI deferred |
| Affiliate links | v1.5 | Single buy URL field for now, no affiliate tagging |
| Lab testing for non-paneer | future | Budget call; schema ready |
| "Reviewed but not approved" comparison block | v2 | Scope confined to Approved only |
| FP quote per product | cut | Not needed |
| Multi-reviewer (other than Revant) | future | Revant-only at launch |
| Trustified-style branded certification badge | future | Schema flag exists, no UI |
| Multi-language (Hindi UI) | future | Brand strings can mix Hindi+English; full UI is English v1 |
| Comparison / similar products block | v2 | Confirmed in clarifying |

---

## 12. Open items (not blockers; resolve in implementation)

1. **OWN-competitor brand exclusion seed list** — Dev to provide actual brand names before launch (e.g., Optimum Nutrition, MuscleBlaze, MyProtein, GNC, Bolt, Pintola if they make whey, etc.). Empty list at spec time.
2. **Notification channel for Revant** — defaulting to email digest at 09:00 IST. Can swap to WhatsApp via Twilio webhook in v1.5.
3. **Re-verification cadence** — 6 months default; lab-tested paneer 12 months. Confirm before launch.
4. **Domain timing** — launch on Vercel default URL; cut over to `foodpharmerapproved.com` (or chosen domain) when ready, ~5 minutes via Cloudflare DNS.
5. **Lab report PDF retention** — 5 years proposed for paneer Eurofins reports. Confirm with legal/compliance before lock.
6. **Pintola whey verification** — before approving Pintola PB at launch, confirm Pintola brand does/doesn't make whey/protein. If yes → exclude entire brand per C2.
7. **Approved → Live transition** — manual button (Dev decides when to publish) vs auto-on-approve. Defaulting to manual; revisit after first 5 approvals.
8. **OCR on image-only labels** — some brand sites publish labels as image-only. Spec assumes Tesseract or cloud OCR; pick library at implementation time.

---

## 13. Success criteria for v1

1. ~17 approved products live across 5 categories (per seed list)
2. Public site loads <1.5s on 4G mobile (Vercel SSG/ISR)
3. Revant clears a 5-product approval queue in <3 minutes on his phone
4. Every Live product has: photo, label image, ingredients, source citation, last-verified date, "Why it passes" with observed values
5. Retract → public 410 Gone within 30 seconds end-to-end
6. Re-verification cron runs successfully on day 180; flagged products surface in Dev's queue

---

## Appendix A — Reference seed data

Spreadsheet: `docs.google.com/spreadsheets/d/1B-p32XheRC0RdpuPo2WEhWoEL-Ryc_Vl1G1r0q0y0us/`
- Tab: Packaged Food — Data (57 products with rating/verdict)
- Tab: Packaged Food — Criteria (per-category rules)
- Tab: Restaurants — Mechanics + Data (Burma Burma plan, deferred to v2)

Existing FP comparison content: `Food Pharmer.pdf` in user's Drive (Apr 13, 2026) — ketchup, paneer, mango drinks, peanut butter, ORS, noodles comparisons. Useful for editorial copy on `/method` and category pages.
