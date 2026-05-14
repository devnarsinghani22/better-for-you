import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLiveProductsForCategory } from "@/lib/products/queries";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CriteriaBlock from "@/components/CriteriaBlock";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const sb = await createClient();
  const { data: cat } = await sb
    .from("categories")
    .select("id, slug, name, blurb")
    .eq("slug", slug)
    .eq("active", true)
    .single();
  if (!cat) notFound();

  const products = await getLiveProductsForCategory(slug);

  // Categories with boxed products that benefit from a tighter crop
  const tightCrop = slug === "biscuits";

  // Subcategory groupings
  const subgroupsBySlug: Record<string, { label: string; productSlugs: string[] }[]> = {
    "peanut-butter": [
      {
        label: "100% Peanut Butter",
        productSlugs: [
          "pintola-all-natural-crunchy-pb",
          "myfitness-unsweetened-crunchy-pb",
        ],
      },
      {
        label: "Peanuts + Whey",
        productSlugs: ["pintola-high-protein-pb", "nut-roasters-hp-whey-pb"],
      },
    ],
  };
  const subgroups = subgroupsBySlug[slug];
  const groupedSlugs = new Set(subgroups?.flatMap((g) => g.productSlugs));
  const ungrouped = subgroups
    ? products.filter((p) => !groupedSlugs.has(p.slug))
    : [];

  return (
    <>
    <SiteHeader />
    <main className="max-w-[1280px] mx-auto px-5 sm:px-10 py-10 sm:py-16 relative z-10">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)] hover:text-[color:var(--accent-deep)] transition-colors"
      >
        ← All categories
      </Link>

      <header className="mt-6 sm:mt-8 pb-8 sm:pb-10 border-b rule">
        <h1 className="font-display text-5xl sm:text-7xl tracking-[-0.02em] leading-[0.95]">
          {cat.name}
        </h1>
        <p className="text-[color:var(--ink-soft)] text-lg max-w-2xl mt-4">
          {cat.blurb}
        </p>
        {slug.startsWith("paneer") && (
          <a
            href="https://youtu.be/zJu117xcs9Y"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 font-display italic text-lg text-[color:var(--accent-deep)] underline decoration-[color:var(--accent)]/60 underline-offset-4 hover:decoration-[color:var(--accent-deep)]"
          >
            Watch Food Pharmer&rsquo;s full breakdown on common paneer brands.
            <span aria-hidden>→</span>
          </a>
        )}
        {slug === "peanut-butter" && (
          <a
            href="https://youtu.be/5lyGl1X6smk"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 font-display italic text-lg text-[color:var(--accent-deep)] underline decoration-[color:var(--accent)]/60 underline-offset-4 hover:decoration-[color:var(--accent-deep)]"
          >
            Watch Food Pharmer&rsquo;s full breakdown on common peanut butter brands.
            <span aria-hidden>→</span>
          </a>
        )}
        {slug === "noodles" && (
          <a
            href="https://youtu.be/b_JZuowrBHQ"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 font-display italic text-lg text-[color:var(--accent-deep)] underline decoration-[color:var(--accent)]/60 underline-offset-4 hover:decoration-[color:var(--accent-deep)]"
          >
            Watch Food Pharmer&rsquo;s full breakdown on common noodle brands.
            <span aria-hidden>→</span>
          </a>
        )}
        {slug === "biscuits" && (
          <a
            href="https://youtu.be/ym4qROz_TtI"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 font-display italic text-lg text-[color:var(--accent-deep)] underline decoration-[color:var(--accent)]/60 underline-offset-4 hover:decoration-[color:var(--accent-deep)]"
          >
            Watch Food Pharmer&rsquo;s full breakdown on common biscuit brands.
            <span aria-hidden>→</span>
          </a>
        )}
        <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
          {products.length} picks
        </div>
      </header>

      {(() => {
        const renderCard = (p: typeof products[number]) => {
          const brand = Array.isArray(p.brand) ? p.brand[0] : p.brand;
          const isLab = p.certification_method === "lab_tested";
          return (
            <Link
              key={p.id}
              href={`/c/${slug}/${p.slug}`}
              className="bg-[color:var(--bg-elev)] border rule rounded-sm overflow-hidden hover:border-[color:var(--ink)] transition-colors block group"
            >
              <div className="aspect-[4/3] bg-white border-b rule flex items-center justify-center overflow-hidden">
                {p.product_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.product_photo_url}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className={
                      tightCrop
                        ? "h-full w-full object-cover scale-125 group-hover:scale-[1.32] transition-transform duration-500"
                        : "max-h-full max-w-full object-contain p-1.5 sm:p-2 group-hover:scale-105 transition-transform duration-500"
                    }
                  />
                ) : (
                  <span className="font-display italic text-3xl text-[color:var(--ink-mute)]/50">
                    {brand?.name}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex-1 min-w-0">
                  <p className="font-display text-2xl sm:text-[28px] tracking-[-0.02em] leading-tight text-[color:var(--ink-soft)]">
                    {brand?.name}
                  </p>
                  <h3 className="font-display text-2xl sm:text-[28px] tracking-[-0.02em] leading-tight text-[color:var(--ink)]">
                    {p.name}
                  </h3>
                </div>
                <div className="mt-4 pt-3 border-t rule flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em]">
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      isLab
                        ? "text-[color:var(--lab)]"
                        : "text-[color:var(--ink-mute)]"
                    }`}
                  >
                    {isLab ? (
                      <>
                        <span aria-hidden>🧪</span> Lab tested
                      </>
                    ) : (
                      <>Label reviewed</>
                    )}
                  </span>
                  <span className="text-[color:var(--ink-mute)] group-hover:text-[color:var(--accent-deep)] transition-colors">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          );
        };

        if (subgroups) {
          const bySlug = new Map(products.map((p) => [p.slug, p]));
          return (
            <div className="mt-10 space-y-12 sm:space-y-16">
              {subgroups.map((g) => {
                const items = g.productSlugs
                  .map((s) => bySlug.get(s))
                  .filter((p): p is typeof products[number] => Boolean(p))
                  .sort((a, b) => {
                    const ba = Array.isArray(a.brand) ? a.brand[0] : a.brand;
                    const bb = Array.isArray(b.brand) ? b.brand[0] : b.brand;
                    return (
                      (ba?.name ?? "").localeCompare(bb?.name ?? "") ||
                      a.name.localeCompare(b.name)
                    );
                  });
                if (items.length === 0) return null;
                return (
                  <section key={g.label}>
                    <h2 className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-tight mb-1">
                      {g.label}
                    </h2>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-5">
                      {items.length} picks
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {items.map(renderCard)}
                    </div>
                  </section>
                );
              })}
              {ungrouped.length > 0 && (
                <section>
                  <h2 className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-tight mb-1">
                    Other
                  </h2>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-5">
                    {ungrouped.length} picks
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {ungrouped.map(renderCard)}
                  </div>
                </section>
              )}
            </div>
          );
        }

        return (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(renderCard)}
          </div>
        );
      })()}

      {products.length === 0 && (
        <p className="mt-12 text-[color:var(--ink-soft)]">No products in this category yet.</p>
      )}

      <CriteriaBlock categoryId={cat.id} />
    </main>
    <SiteFooter />
    </>
  );
}
