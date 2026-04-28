import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://foodpharmer-approved.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = await createClient();

  const [{ data: cats }, { data: prods }] = await Promise.all([
    sb.from("categories").select("slug, created_at").eq("active", true),
    sb
      .from("products")
      .select("slug, updated_at, category:categories(slug)")
      .eq("status", "Live"),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/method",
    "/contact",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const catPages: MetadataRoute.Sitemap = (cats ?? []).map((c) => ({
    url: `${BASE_URL}/c/${c.slug}`,
    lastModified: new Date(c.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const prodPages: MetadataRoute.Sitemap = (prods ?? [])
    .map((p) => {
      const cat = p.category as { slug: string } | { slug: string }[] | null;
      const catSlug = Array.isArray(cat) ? cat[0]?.slug : cat?.slug;
      if (!catSlug) return null;
      return {
        url: `${BASE_URL}/c/${catSlug}/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return [...staticPages, ...catPages, ...prodPages];
}
