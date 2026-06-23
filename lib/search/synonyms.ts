// Search synonyms — bridge the words people actually type to the categories we
// actually have. Clarity showed real searches for "curd" dead-ending: we file
// it under the active "yogurt" category (the "curd" category is inactive), so a
// literal name/ingredient match returns little. This maps colloquial and
// regional Indian terms + alternate spellings onto the canonical ACTIVE
// category slugs and a few extra name terms to widen the product match.
//
// Keys are normalised (lowercase, single-spaced). Only map onto categories that
// are actually live — a stale slug just surfaces nothing, but keep this honest.
// Multi-word keys (e.g. "bean curd") are matched against the whole query first
// so "bean curd" → tofu, not yogurt.

type Alias = {
  // Active category slugs to surface directly in the Categories section.
  slugs: string[];
  // Extra terms to OR into the product name/ingredient search.
  terms: string[];
};

const ALIASES: Record<string, Alias> = {
  // Yogurt / curd — the headline gap from analytics. Indian "curd"/"dahi" ==
  // yoghurt; both the US ("yogurt") and UK/India ("yoghurt") spellings map to
  // the active Yoghurt category (slug "yogurt"). The live product NAMES are
  // spelled "Yoghurt", so the name term must be "yoghurt" to actually match them
  // (a "yogurt" term would surface only the category, not the products).
  curd: { slugs: ["yogurt"], terms: ["yoghurt"] },
  dahi: { slugs: ["yogurt"], terms: ["yoghurt"] },
  dahee: { slugs: ["yogurt"], terms: ["yoghurt"] },
  yogurt: { slugs: ["yogurt"], terms: ["yoghurt"] },
  yoghurt: { slugs: ["yogurt"], terms: ["yoghurt"] },
  yoghourt: { slugs: ["yogurt"], terms: ["yoghurt"] },

  // Biscuits
  cookie: { slugs: ["biscuits"], terms: ["biscuit"] },
  cookies: { slugs: ["biscuits"], terms: ["biscuit"] },

  // Peanut butter
  groundnut: { slugs: ["peanut-butter"], terms: ["peanut"] },
  moongphali: { slugs: ["peanut-butter"], terms: ["peanut"] },
  mungfali: { slugs: ["peanut-butter"], terms: ["peanut"] },
  mumfali: { slugs: ["peanut-butter"], terms: ["peanut"] },

  // Makhana (fox nut / lotus seed)
  makhane: { slugs: ["makhana"], terms: ["makhana"] },
  foxnut: { slugs: ["makhana"], terms: ["makhana"] },
  "fox nut": { slugs: ["makhana"], terms: ["makhana"] },
  "lotus seed": { slugs: ["makhana"], terms: ["makhana"] },
  "lotus seeds": { slugs: ["makhana"], terms: ["makhana"] },
  "phool makhana": { slugs: ["makhana"], terms: ["makhana"] },

  // Paneer / tofu
  "cottage cheese": { slugs: ["paneer", "paneer-high-protein"], terms: ["paneer"] },
  "bean curd": { slugs: ["tofu"], terms: ["tofu"] },

  // Noodles
  ramen: { slugs: ["noodles"], terms: ["noodles"] },
  maggi: { slugs: ["noodles"], terms: ["noodles"] },

  // ORS / electrolytes
  electrolyte: { slugs: ["ors"], terms: ["ors", "electrolyte"] },
  electrolytes: { slugs: ["ors"], terms: ["ors", "electrolyte"] },
  rehydration: { slugs: ["ors"], terms: ["ors"] },

  // Chips
  crisps: { slugs: ["chips", "chips-protein"], terms: ["chips"] },

  // Popcorn
  "pop corn": { slugs: ["popcorn"], terms: ["popcorn"] },
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Expand a raw search query into extra product-name terms and category slugs
 * to surface. Matches the whole query against multi-word aliases first, then
 * falls back to per-word single aliases. Returns deduped, empty when nothing
 * matches (callers should treat empty as "no expansion").
 */
export function expandQuery(query: string): { terms: string[]; slugs: string[] } {
  const q = norm(query);
  if (q.length < 2) return { terms: [], slugs: [] };

  const slugs = new Set<string>();
  const terms = new Set<string>();

  // Whole-query match wins (keeps "bean curd" → tofu, not yogurt).
  const whole = ALIASES[q];
  if (whole) {
    whole.slugs.forEach((s) => slugs.add(s));
    whole.terms.forEach((t) => terms.add(t));
  } else {
    // Fall back to matching individual words against single-word aliases.
    for (const word of q.split(" ")) {
      const hit = ALIASES[word];
      if (hit) {
        hit.slugs.forEach((s) => slugs.add(s));
        hit.terms.forEach((t) => terms.add(t));
      }
    }
  }

  // Never echo a term the query already contains — it adds no new matches.
  for (const t of [...terms]) if (q.includes(t)) terms.delete(t);

  return { terms: [...terms], slugs: [...slugs] };
}
