import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Search",
  description: "Search Better for You by Food Pharmer by product, brand, or category.",
};

type SP = Promise<{ q?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const showResults = query.length >= 2;

  const sb = await createClient();

  const [productsRes, categoriesRes] = showResults
    ? await Promise.all([
        sb
          .from("products")
          .select(
            "id, slug, name, certification_method, product_photo_url, brand:brands(slug,name), category:categories(slug,name)"
          )
          .eq("status", "Live")
          .or(`name.ilike.%${query}%,ingredients_raw.ilike.%${query}%`)
          .limit(40),
        sb
          .from("categories")
          .select("slug, name, blurb")
          .eq("active", true)
          .ilike("name", `%${query}%`),
      ])
    : [{ data: [] }, { data: [] }];

  // Also try matching by brand name (separate query — Supabase ilike across
  // joined tables needs a different approach)
  let brandHits: typeof productsRes.data = [];
  if (showResults) {
    const { data: brands } = await sb
      .from("brands")
      .select("id")
      .ilike("name", `%${query}%`)
      .limit(20);
    const brandIds = (brands ?? []).map((b) => b.id);
    if (brandIds.length > 0) {
      const { data } = await sb
        .from("products")
        .select(
          "id, slug, name, certification_method, product_photo_url, brand:brands(slug,name), category:categories(slug,name)"
        )
        .eq("status", "Live")
        .in("brand_id", brandIds)
        .limit(20);
      brandHits = data ?? [];
    }
  }

  // Merge product results, dedup by id
  const productMap = new Map<number, NonNullable<typeof productsRes.data>[number]>();
  for (const p of productsRes.data ?? []) productMap.set(p.id, p);
  for (const p of brandHits ?? []) productMap.set(p.id, p);
  const products = Array.from(productMap.values()).sort((a, b) => {
    const ba = Array.isArray(a.brand) ? a.brand[0] : a.brand;
    const bb = Array.isArray(b.brand) ? b.brand[0] : b.brand;
    return (
      (ba?.name ?? "").localeCompare(bb?.name ?? "") ||
      a.name.localeCompare(b.name)
    );
  });
  const categories = categoriesRes.data ?? [];

  const totalHits = products.length + categories.length;

  return (
    <>
      <SiteHeader />
      <main className="max-w-[1100px] mx-auto px-6 sm:px-10 py-12 sm:py-16 relative z-10 flex-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
          Search
        </p>
        <h1 className="font-display text-4xl sm:text-6xl tracking-[-0.02em] leading-[0.95] mt-3">
          {showResults ? <>Results for &ldquo;{query}&rdquo;</> : <>Search</>}
        </h1>

        <form
          action="/search"
          method="GET"
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Try 'pintola', 'paneer', 'palm oil'..."
            className="flex-1 bg-[color:var(--bg-elev)] border-2 border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors"
          >
            Search →
          </button>
        </form>

        {showResults && (
          <div className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            {totalHits} {totalHits === 1 ? "match" : "matches"}
          </div>
        )}

        {showResults && categories.length > 0 && (
          <section className="mt-8">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-3">
              Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/c/${c.slug}`}
                  className="block bg-[color:var(--bg-elev)] border rule rounded-sm p-5 hover:border-[color:var(--ink)] transition-colors"
                >
                  <h3 className="font-display text-2xl tracking-tight">
                    {c.name}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {showResults && products.length > 0 && (
          <section className="mt-10">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-3">
              Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => {
                const brand = Array.isArray(p.brand) ? p.brand[0] : p.brand;
                const cat = Array.isArray(p.category) ? p.category[0] : p.category;
                const isLab = p.certification_method === "lab_tested";
                if (!cat?.slug) return null;
                return (
                  <Link
                    key={p.id}
                    href={`/c/${cat.slug}/${p.slug}`}
                    className="bg-[color:var(--bg-elev)] border rule rounded-sm overflow-hidden hover:border-[color:var(--ink)] transition-colors block group flex"
                  >
                    <div className="w-[110px] shrink-0 bg-white border-r rule flex items-center justify-center">
                      {p.product_photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.product_photo_url}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="font-display italic text-xl text-[color:var(--ink-mute)]/50 px-2 text-center">
                          {brand?.name}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                          {brand?.name} · {cat?.name}
                        </p>
                        <h3 className="font-display text-lg tracking-tight mt-1 leading-tight">
                          {p.name}
                        </h3>
                      </div>
                      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em]">
                        <span className={isLab ? "text-[color:var(--lab)]" : "text-[color:var(--ink-mute)]"}>
                          {isLab ? "🧪 Lab tested" : "Label reviewed"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {showResults && totalHits === 0 && (
          <div className="mt-10 bg-[color:var(--bg-elev)] border rule rounded-sm p-8">
            <p className="text-lg text-[color:var(--ink-soft)]">
              No matches found for{" "}
              <span className="text-[color:var(--ink)]">&ldquo;{query}&rdquo;</span>.
            </p>
          </div>
        )}

        {!showResults && (
          <p className="mt-6 text-sm text-[color:var(--ink-soft)]">
            Type at least 2 letters. We search product names, brands, and
            ingredient lists.
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
