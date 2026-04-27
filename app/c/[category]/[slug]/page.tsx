import { notFound } from "next/navigation";
import Link from "next/link";
import { getLiveProductBySlug } from "@/lib/products/queries";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const product = await getLiveProductBySlug(category, slug);
  if (!product) notFound();

  const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand;
  const cat = product.category;
  const isLab = product.certification_method === "lab_tested";
  const verifiedDate = product.last_verified_at
    ? new Date(product.last_verified_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <main className="max-w-[900px] mx-auto px-6 sm:px-10 py-16 relative z-10">
      <nav className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
        <Link href={`/c/${category}`} className="hover:text-[color:var(--accent-deep)] transition-colors">
          ← {cat.name}
        </Link>
      </nav>

      <header className="mt-8 pb-8 border-b rule">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
          {brand?.name}
        </p>
        <h1 className="font-display text-5xl sm:text-6xl tracking-[-0.02em] leading-[0.95] mt-3">
          {product.name}
        </h1>
        {product.variant_size && (
          <p className="text-lg text-[color:var(--ink-soft)] mt-2">{product.variant_size}</p>
        )}
      </header>

      <section className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-2">
            Verdict
          </div>
          <div className="font-display text-2xl tracking-tight">
            Food Pharmer Approved
          </div>
          <div className="mt-1">
            <span className="inline-block bg-[color:var(--accent)]/40 px-1.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                Rating {product.rating ?? "—"}
              </span>
            </span>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-2">
            Certification
          </div>
          <div
            className={`font-display text-2xl tracking-tight ${
              isLab ? "text-[color:var(--lab)]" : ""
            }`}
          >
            {isLab ? "Lab-verified ✓" : "Label-tested"}
          </div>
          {!isLab && (
            <p className="text-xs text-[color:var(--ink-mute)] mt-1 leading-snug">
              Verified from product label, not chemical analysis.
            </p>
          )}
          {isLab && (
            <p className="text-xs text-[color:var(--ink-mute)] mt-1 leading-snug">
              Eurofins analytical report on file.
            </p>
          )}
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-2">
            Last verified
          </div>
          <div className="font-display text-2xl tracking-tight">
            {verifiedDate ?? "—"}
          </div>
        </div>
      </section>

      {product.primary_buy_url && (
        <a
          href={product.primary_buy_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors"
        >
          Where to buy →
        </a>
      )}

      {product.ingredients_raw && (
        <section className="mt-16 border-t rule pt-10">
          <h2 className="font-display text-3xl tracking-tight">Ingredients</h2>
          <p className="text-[color:var(--ink-soft)] mt-4 leading-relaxed">
            {product.ingredients_raw}
          </p>
        </section>
      )}

      <footer className="mt-20 pt-8 border-t rule font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
        Re-verified every 6 months · brands change formulations ·{" "}
        <Link href="/" className="underline hover:text-[color:var(--accent-deep)]">
          back to home
        </Link>
      </footer>
    </main>
  );
}
