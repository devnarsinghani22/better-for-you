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

  return (
    <>
    <SiteHeader />
    <main className="max-w-[1280px] mx-auto px-6 sm:px-10 py-16 relative z-10">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)] hover:text-[color:var(--accent-deep)] transition-colors"
      >
        ← All categories
      </Link>

      <header className="mt-8 pb-10 border-b rule">
        <h1 className="font-display text-5xl sm:text-7xl tracking-[-0.02em] leading-[0.95]">
          {cat.name}
        </h1>
        <p className="text-[color:var(--ink-soft)] text-lg max-w-2xl mt-4">
          {cat.blurb}
        </p>
        <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
          {products.length} approved
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => {
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
                    className="max-h-full max-w-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="font-display italic text-3xl text-[color:var(--ink-mute)]/50">
                    {brand?.name}
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                  {brand?.name}
                </p>
                <h3 className="font-display text-2xl tracking-[-0.02em] mt-1.5 leading-tight">
                  {p.name}
                </h3>
                {p.variant_size && (
                  <p className="text-sm text-[color:var(--ink-soft)] mt-1">{p.variant_size}</p>
                )}
                <div className="mt-4 pt-3 border-t rule flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em]">
                  <span className={isLab ? "text-[color:var(--lab)]" : "text-[color:var(--ink-mute)]"}>
                    {isLab ? "Lab tested ✓" : "Label reviewed"}
                  </span>
                  <span className="text-[color:var(--ink-mute)] group-hover:text-[color:var(--accent-deep)] transition-colors">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {products.length === 0 && (
        <p className="mt-12 text-[color:var(--ink-soft)]">No approved products in this category yet.</p>
      )}

      <CriteriaBlock categoryId={cat.id} />
    </main>
    <SiteFooter />
    </>
  );
}
