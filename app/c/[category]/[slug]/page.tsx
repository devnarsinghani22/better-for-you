import { notFound } from "next/navigation";
import Link from "next/link";
import { getLiveProductBySlug } from "@/lib/products/queries";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CriteriaBlock from "@/components/CriteriaBlock";

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
    <>
    <SiteHeader />
    <main className="max-w-[1100px] mx-auto px-6 sm:px-10 py-16 relative z-10">
      <nav className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
        <Link href={`/c/${category}`} className="hover:text-[color:var(--accent-deep)] transition-colors">
          ← {cat.name}
        </Link>
      </nav>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-8 pb-10 border-b rule">
        {product.product_photo_url ? (
          <div className="lg:col-span-5 bg-white border rule rounded-sm overflow-hidden aspect-square flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.product_photo_url}
              alt={product.name}
              className="max-h-full max-w-full object-contain p-6"
            />
          </div>
        ) : (
          <div className="lg:col-span-5 bg-[color:var(--bg-elev)] border rule rounded-sm aspect-square flex items-center justify-center">
            <span className="font-display italic text-4xl text-[color:var(--ink-mute)]/50 text-center px-8">
              {brand?.name}
            </span>
          </div>
        )}

        <header className="lg:col-span-7 flex flex-col justify-center">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            {brand?.name}
          </p>
          <h1 className="font-display text-5xl sm:text-6xl tracking-[-0.02em] leading-[0.95] mt-3">
            {product.name}
          </h1>
          {product.variant_size && (
            <p className="text-lg text-[color:var(--ink-soft)] mt-2">{product.variant_size}</p>
          )}
          <div className="mt-6 inline-flex items-center gap-3">
            <span className="bg-[color:var(--accent)] text-[color:var(--ink)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em]">
              Food Pharmer Approved
            </span>
            {product.rating && (
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">
                Rating {product.rating}
              </span>
            )}
          </div>
        </header>
      </div>

      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-2">
            Certification
          </div>
          <div
            className={`font-display text-2xl tracking-tight ${
              isLab ? "text-[color:var(--lab)]" : ""
            }`}
          >
            {isLab ? "Lab tested ✓" : "Label reviewed"}
          </div>
          {!isLab && (
            <p className="text-xs text-[color:var(--ink-mute)] mt-1 leading-snug">
              We read the ingredients off the brand&rsquo;s pack. We did not
              run a chemistry test on this one.
            </p>
          )}
          {isLab && (
            <p className="text-xs text-[color:var(--ink-mute)] mt-1 leading-snug">
              A certified lab tested this product.
            </p>
          )}
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-2">
            Last verified
          </div>
          <div className="font-display text-2xl tracking-tight">
            {verifiedDate ?? "Pending"}
          </div>
        </div>
      </section>

      <section className="mt-12 border-t rule pt-10">
        <h2 className="font-display text-3xl tracking-tight">Ingredients</h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mt-1">
          As printed on the pack · verbatim
        </p>
        {product.ingredients_raw ? (
          <div className="mt-5 bg-[color:var(--bg-elev)] border rule rounded-sm p-6">
            <p className="text-base sm:text-lg text-[color:var(--ink)] leading-relaxed">
              {product.ingredients_raw}
            </p>
          </div>
        ) : (
          <div className="mt-5 bg-[color:var(--bg-elev)] border rule rounded-sm p-6">
            <p className="text-[color:var(--ink-soft)] leading-relaxed">
              We are still capturing the verbatim ingredient list for this
              product. Until then, you can read the label on the brand&rsquo;s
              own page.
            </p>
            {product.primary_buy_url && (
              <a
                href={product.primary_buy_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.22em] underline hover:text-[color:var(--accent-deep)]"
              >
                Open the source page →
              </a>
            )}
          </div>
        )}
      </section>

      {product.label_image_url && (
        <section className="mt-12 border-t rule pt-10">
          <h2 className="font-display text-3xl tracking-tight">Nutrition label</h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mt-1">
            Cropped from the source page · {brand?.name}
          </p>
          <div className="mt-5 bg-white border rule rounded-sm p-3 inline-block max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.label_image_url}
              alt={`${product.name} label`}
              className="max-w-full h-auto"
            />
          </div>
        </section>
      )}

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


      <CriteriaBlock categoryId={cat.id} />

      <footer className="mt-16 pt-8 border-t rule font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
        We re-check every 6 months · brands sometimes change recipes ·{" "}
        <Link href="/" className="underline hover:text-[color:var(--accent-deep)]">
          back to home
        </Link>
      </footer>
    </main>
    <SiteFooter />
    </>
  );
}
