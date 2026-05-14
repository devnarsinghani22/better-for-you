# Peanut Butter — combined criteria (staging)

**Status:** awaiting your sign-off. No DB changes have been made.
**Source:** <https://docs.google.com/spreadsheets/d/16RX96lKVUhTz0uVLikS73HICJtaXu3vxS7hR0vGdzw0/edit>
  - Tab "100% Peanut Butter"  → `gid=143839530`
  - Tab "Peanut Butter + Whey" → `gid=1180059534`

Note: ignoring the "Revant's Approval" column per your instruction — everything below is treated as approved.

---

## Combined criteria (final, as bullet list with tick marks)

These are the rules the site will display on `/c/peanut-butter` and on `/method`. They apply to **all** peanut butter products, whether 100% peanuts or peanuts + whey.

- ✓ 100% peanuts or peanuts + whey
- ✓ No sugar
- ✓ No salt
- ✓ No hydrogenated oils

Plus the site-wide universals that apply to every category:
- ✓ No artificial colours
- ✓ No artificial flavours
- ✓ No emulsifiers (E471 / E322 / etc.)

### Diff vs. current DB

| order | sheet says                          | DB says                                  | action |
|-------|-------------------------------------|------------------------------------------|--------|
| 10    | 100% peanuts or peanuts + whey      | 100% peanuts. Or peanuts plus whey.      | rephrase to match sheet |
| 20    | No sugar                            | (part of) No added sugar, salt, or oil.  | split into three separate rules |
| 30    | No salt                             | (part of) No added sugar, salt, or oil.  | split |
| 40    | No hydrogenated oils                | (part of) No added sugar, salt, or oil.  | split — and **loosen**: only hydrogenated oils, not all added oil |
| —     | *(not in sheet)*                    | At least 25 g protein per 100 g.         | **DROP** from DB |

---

## Products — sheet vs. DB

### Sheet says these 6 are approved (combining both tabs)

| brand            | name                                                   | tab    | in DB?              |
|------------------|--------------------------------------------------------|--------|---------------------|
| Myfitness        | Natural Unsweetened Peanut Butter Crunchy              | 100%   | ✓ id=8, Live        |
| Pintola          | All Natural Peanut Butter Crunchy                      | 100%   | ✓ id=19, Live       |
| Alpino           | Peanut Butter Crunch                                   | 100%   | ✗ **missing**       |
| The Butternut Co.| Natural Peanut Butter (Creamy)                         | 100%   | ✗ **missing**       |
| Nut Roasters     | Zero Sugar High Protein Peanut Butter with Whey        | +Whey  | ✓ id=20, Live       |
| Pintola          | High Protein Peanut Butter Creamy                      | +Whey  | ✓ id=9, Live        |

### DB has these PB products not on the sheet

| id | brand        | name                       | current status | action |
|----|--------------|----------------------------|----------------|--------|
| 7  | Pintola      | Peanut Butter Crunchy      | Draft          | **retract** (looks like a stale Draft superseded by id=19 "All Natural Peanut Butter Crunchy") |
| 10 | Nut Roasters | Crunchy Peanut Butter      | Retracted      | already retracted — no action |

---

## Source URLs from the sheet (extracted from the hyperlinks)

Pulled by reading the .ods export — the CSV strips hyperlinks but ODS preserves them.

| product (sheet text)                                             | url |
|------------------------------------------------------------------|-----|
| Myfitness Natural Unsweetened Peanut Butter Crunchy              | https://myfitness.in/products/myfitness-all-natural-peanut-butter-crunchy?variant=39986581602458 |
| Pintola All Natural Peanut Butter Crunchy                        | https://pintola.in/products/all-natural-peanut-butter |
| Alpino Peanut Butter Crunch                                      | https://alpino.store/products/alpino-natural-peanut-butter-crunch (variant 1KG) |
| The Butternut Co. Natural Peanut Butter (Creamy)                 | https://www.thebutternutcompany.com/products/the-butternut-co-natural-peanut-butter-creamy-800-2000000094453 |
| Nut Roasters Zero Sugar High Protein Peanut Butter with Whey     | https://nutroasters.in/products/high-protein-peanut-butter-unsweetened-vegan-keto |
| Pintola High Protein Peanut Butter Creamy                        | https://pintola.in/products/high-protein-all-natural-peanut-butter-unsweetened |

The 4 already-Live products already have these (or equivalent) URLs in the DB — **preserving existing rows untouched** per your direction.

## New product details (scraped from the Shopify product JSON)

### Alpino — Natural Peanut Butter Crunch (1 kg)

- brand: **Alpino** (new — not in `brands` table)
- name: `Natural Peanut Butter Crunch`
- slug: `alpino-natural-pb-crunch`
- variant_size: `1 kg` (the variant ID 37823674613930 the sheet linked to is the 1KG SKU; product also sold in 400g/800g/2kg)
- ingredients_raw: `100% Roasted Peanuts.`
- product_photo_url: `https://cdn.shopify.com/s/files/1/0520/1572/6762/files/01_fceda9eb-0634-4684-805f-f7296a0b1a6f.webp?v=1751280803`
- label_image_url: `https://cdn.shopify.com/s/files/1/0520/1572/6762/files/DSC5343.jpg?v=1751280803` (Shopify image[1] — likely the back-of-pack)
- primary_buy_url: `https://alpino.store/products/alpino-natural-peanut-butter-crunch`
- certification_method: `label_tested`
- rating: null
- nutrition: null (brand description mentions 30 g protein / 100 g but no full table)

### The Butternut Co. — Natural Peanut Butter (Creamy) 800 g

- brand: **The Butternut Co.** (new — not in `brands` table)
- name: `Natural Peanut Butter (Creamy)`
- slug: `butternutco-natural-creamy-pb`
- variant_size: `800 g`
- ingredients_raw: `100% Dry Roasted Peanuts.`
- product_photo_url: `https://cdn.shopify.com/s/files/1/0697/2784/6683/files/ybq5x2kpolldxojrnkcx.jpg?v=1738536389`
- label_image_url: `https://cdn.shopify.com/s/files/1/0697/2784/6683/files/gio7i2nikpfu8myervch.jpg?v=1738536389` (Shopify image[1] — likely the back-of-pack)
- primary_buy_url: `https://www.thebutternutcompany.com/products/the-butternut-co-natural-peanut-butter-creamy-800-2000000094453`
- certification_method: `label_tested`
- rating: null
- nutrition: null (brand description mentions 32 g protein / 100 g but no full table)

---

## Resolved (Dev's answers)

1. **Ratings** — set to `null` on new products. Rating chip was still showing on `/search`; that has been removed in a separate commit (rating-chip + the `rating` field in the SELECT). Existing rows keep their `rating` value in DB but it's no longer rendered anywhere on the public site (admin still uses it).
2. **Nutrition** — pull the back-of-pack label image as `label_image_url`. Using `images[1]` from each brand's Shopify product JSON (standard convention: image[0] = front, image[1] = back/nutrition). Nutrition JSON stays `null` since the brand pages only give protein in prose; PDP will render the label image instead.
3. **id=7 retract** — proceeding (you didn't push back).
4. **Universals** — confirmed; the 3 site-wide rules still apply to PB.

## Pending sign-off

The only remaining gate is: **"go" on the SQL block at the bottom**. Once you say go, I'll run it as a single transaction.

---

## Preservation guarantee for the 4 existing Live products

The four products already on the site (Myfitness id=8, Pintola All Natural id=19, Nut Roasters HP+Whey id=20, Pintola HP id=9) **keep all of their existing data unchanged**:

- product_photo_url, label_image_url, primary_buy_url
- ingredients_raw, nutrition JSON
- rating, certification_method, lab_report_url
- variant_size, last_verified_at, slug, name, brand_id

The criteria changes happen entirely in the `category_rules` table — they do not touch the `products` table at all. The only `products` UPDATE below changes status on id=7 (the stale Draft), nothing else.

---

## Draft SQL (do NOT run yet)

```sql
-- 1. Criteria changes — only writes to category_rules. Does NOT touch any product row.
UPDATE category_rules SET active = false
  WHERE category_id = 5 AND id IN (21, 22);  -- deactivate old combined rule + protein rule

UPDATE category_rules SET description = '100% peanuts or peanuts + whey'
  WHERE category_id = 5 AND id = 20;  -- rephrase to match sheet

INSERT INTO category_rules (category_id, code, description, display_order, active) VALUES
  (5, 'pb_no_sugar',         'No sugar',              20, true),
  (5, 'pb_no_salt',          'No salt',               30, true),
  (5, 'pb_no_hydrogen_oil',  'No hydrogenated oils',  40, true);

-- 2. Retract the stale Pintola Crunchy draft. Touches ONLY the status column on id=7.
--    The 4 existing Live PB products (id=8, 9, 19, 20) are not touched.
UPDATE products SET status = 'Retracted' WHERE id = 7;

-- 3. Brands — INSERT new rows only.
INSERT INTO brands (slug, name) VALUES
  ('alpino',             'Alpino'),
  ('the-butternut-co',   'The Butternut Co.');

-- 4. Two new PB products — INSERT only. rating left NULL per Dev's note that
--    ratings are removed from the public site. last_verified_at = now() so the
--    "Last verified" block on the PDP shows today's date.
INSERT INTO products (
  slug, name, brand_id, category_id, status, certification_method,
  variant_size, ingredients_raw, product_photo_url, label_image_url,
  primary_buy_url, last_verified_at
) VALUES (
  'alpino-natural-pb-crunch',
  'Natural Peanut Butter Crunch',
  (SELECT id FROM brands WHERE slug='alpino'),
  5,
  'Live',
  'label_tested',
  '1 kg',
  '100% Roasted Peanuts.',
  'https://cdn.shopify.com/s/files/1/0520/1572/6762/files/01_fceda9eb-0634-4684-805f-f7296a0b1a6f.webp?v=1751280803',
  'https://cdn.shopify.com/s/files/1/0520/1572/6762/files/DSC5343.jpg?v=1751280803',
  'https://alpino.store/products/alpino-natural-peanut-butter-crunch',
  now()
), (
  'butternutco-natural-creamy-pb',
  'Natural Peanut Butter (Creamy)',
  (SELECT id FROM brands WHERE slug='the-butternut-co'),
  5,
  'Live',
  'label_tested',
  '800 g',
  '100% Dry Roasted Peanuts.',
  'https://cdn.shopify.com/s/files/1/0697/2784/6683/files/ybq5x2kpolldxojrnkcx.jpg?v=1738536389',
  'https://cdn.shopify.com/s/files/1/0697/2784/6683/files/gio7i2nikpfu8myervch.jpg?v=1738536389',
  'https://www.thebutternutcompany.com/products/the-butternut-co-natural-peanut-butter-creamy-800-2000000094453',
  now()
);
```

---

## Want me to apply the same treatment to other categories?

The sheet has tabs for the other categories too (Biscuits, Noodles, Paneer variants, Rusks — Rusks is already retired). If you'd like, I can pull each tab and stage them the same way under `docs/criteria-staging/{slug}.md`. Just say which ones.
