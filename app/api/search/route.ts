import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
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
      .eq("status", "Live")
      .or(`name.ilike.${like}${brandClause}`)
      .limit(12),
    sb
      .from("categories")
      .select("slug, name")
      .eq("active", true)
      .ilike("name", like)
      .limit(6),
  ]);

  return NextResponse.json({
    products: productsRes.data ?? [],
    categories: categoriesRes.data ?? [],
  });
}
