import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { visibleProductStatuses } from "@/lib/products/visibility";
import { expandQuery } from "@/lib/search/synonyms";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (q.length < 1) {
    return NextResponse.json({ products: [], categories: [] });
  }

  const sb = await createClient();

  // Escape LIKE wildcards and strip characters that would break a PostgREST
  // or-filter; wrap as a contains pattern.
  const pat = (t: string) =>
    `%${t.replace(/[,()]/g, "").replace(/[%_]/g, (m) => `\\${m}`)}%`;

  // Map colloquial/regional terms (e.g. "curd" → Yoghurt) onto active category
  // slugs + extra product-name terms, so the type-ahead dropdown matches the
  // /search results page instead of dead-ending. See lib/search/synonyms.
  const { terms: synTerms, slugs: synSlugs } = expandQuery(q);

  const { data: brandList } = await sb
    .from("brands")
    .select("id")
    .ilike("name", pat(q))
    .limit(15);
  const brandIds = (brandList ?? []).map((b) => b.id);
  const brandClause =
    brandIds.length > 0 ? `,brand_id.in.(${brandIds.join(",")})` : "";

  // Original query + synonym terms matched on name + ingredients, plus brand-id
  // matches.
  const productOr =
    [q, ...synTerms]
      .map((t) => `name.ilike.${pat(t)},ingredients_raw.ilike.${pat(t)}`)
      .join(",") + brandClause;

  // Category by name, plus a direct slug match for synonyms so "curd" surfaces
  // the Yoghurt category even though its name has no "curd".
  const categoryOr = [
    `name.ilike.${pat(q)}`,
    ...(synSlugs.length ? [`slug.in.(${synSlugs.join(",")})`] : []),
  ].join(",");

  const [productsRes, categoriesRes] = await Promise.all([
    sb
      .from("products")
      .select(
        "slug, name, product_photo_url, brand:brands(slug,name), category:categories(slug,name)"
      )
      .in("status", visibleProductStatuses() as string[])
      .or(productOr)
      .limit(12),
    sb
      .from("categories")
      .select("slug, name")
      .eq("active", true)
      .or(categoryOr)
      .limit(6),
  ]);

  const products = productsRes.data ?? [];
  const categories = categoriesRes.data ?? [];

  // Log every search with a hit count (misses included). Fire-and-forget —
  // never block the response. Skip single-character noise from
  // suggestion-as-you-type.
  const result_count = products.length + categories.length;
  if (q.length >= 2) {
    void sb
      .from("click_events")
      .insert({
        type: result_count === 0 ? "search_miss" : "search_hit",
        query: q.slice(0, 200),
        result_count,
        user_agent: req.headers.get("user-agent")?.slice(0, 240) ?? null,
        referer: req.headers.get("referer")?.slice(0, 500) ?? null,
      })
      .then(() => {}, () => {});
  }

  return NextResponse.json({ products, categories });
}
