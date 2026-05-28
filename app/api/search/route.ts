import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { visibleProductStatuses } from "@/lib/products/visibility";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (q.length < 1) {
    return NextResponse.json({ products: [], categories: [] });
  }

  const sb = await createClient();
  const like = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;

  const { data: brandList } = await sb
    .from("brands")
    .select("id")
    .ilike("name", like)
    .limit(15);
  const brandIds = (brandList ?? []).map((b) => b.id);

  const brandClause = brandIds.length > 0 ? `,brand_id.in.(${brandIds.join(",")})` : "";

  const [productsRes, categoriesRes] = await Promise.all([
    sb
      .from("products")
      .select(
        "slug, name, product_photo_url, brand:brands(slug,name), category:categories(slug,name)"
      )
      .in("status", visibleProductStatuses() as string[])
      .or(`name.ilike.${like}${brandClause}`)
      .limit(12),
    sb
      .from("categories")
      .select("slug, name")
      .eq("active", true)
      .ilike("name", like)
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
