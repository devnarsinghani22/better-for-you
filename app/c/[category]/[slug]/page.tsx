import { notFound } from "next/navigation";
import Link from "next/link";
import { getLiveProductBySlug } from "@/lib/products/queries";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FeedbackBlock from "@/components/FeedbackBlock";
import NutritionCard from "@/components/NutritionCard";
import WhatsAppShare from "@/components/WhatsAppShare";

const SITE_URL = "https://foodpharmer.health";

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

  const sb = await createClient();
  const { data: counts } = await sb
    .rpc("get_feedback_counts", { p_product_id: product.id })
    .single<{ helpful_count: number; unhelpful_count: number; total_count: number }>();
  const helpful = Number(counts?.helpful_count ?? 0);
  const unhelpful = Number(counts?.unhelpful_count ?? 0);
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
    <main className="max-w-[1100px] mx-auto px-5 sm:px-10 py-10 sm:py-16 relative z-10">
      <nav className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
        <Link href={`/c/${category}`} className="hover:text-[color:var(--accent-deep)] transition-colors">
          ← {cat.name}
        </Link>
      </nav>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-8 pb-10 border-b rule">
        {product.product_photo_url ? (
          <div className="lg:col-span-5 overflow-hidden h-80 sm:h-[440px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.product_photo_url}
              alt={product.name}
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-contain p-4 sm:p-6"
            />
          </div>
        ) : (
          <div className="lg:col-span-5 bg-[color:var(--bg-elev)] border rule rounded-sm aspect-[4/3] sm:aspect-square max-h-[440px] flex items-center justify-center">
            <span className="font-display italic text-3xl sm:text-4xl text-[color:var(--ink-mute)]/50 text-center px-8">
              {brand?.name}
            </span>
          </div>
        )}

        <header className="lg:col-span-7 flex flex-col justify-center">
          <p className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] leading-tight text-[color:var(--ink-soft)]">
            {brand?.name}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[0.95] mt-1 sm:mt-2 text-[color:var(--ink)]">
            {product.name}
          </h1>
          <div className="mt-6 inline-flex items-center gap-3">
            <span className="bg-[color:var(--ink)] text-[color:var(--bg)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em]">
              Better for You
            </span>
          </div>
          {product.primary_buy_url && (
            <a
              href={product.primary_buy_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-6 py-4 sm:py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors"
            >
              Source →
            </a>
          )}
        </header>
      </div>

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

      {product.nutrition && Object.keys(product.nutrition as object).length > 0 ? (
        <section className="mt-12 border-t rule pt-10">
          <h2 className="font-display text-3xl tracking-tight">Nutrition</h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mt-1">
            As declared on the pack · re-verified every six months
          </p>
          <div className="mt-5">
            <NutritionCard
              data={product.nutrition as Parameters<typeof NutritionCard>[0]["data"]}
              brand={brand?.name}
            />
          </div>
        </section>
      ) : product.label_image_url ? (
        <section className="mt-12 border-t rule pt-10">
          <h2 className="font-display text-3xl tracking-tight">Nutrition label</h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mt-1">
            Cropped from the source page · {brand?.name}
          </p>
          <div className="mt-5 p-3 inline-block max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.label_image_url}
              alt={`${product.name} label`}
              loading="lazy"
              decoding="async"
              className="max-w-full h-auto"
            />
          </div>
        </section>
      ) : null}

      <div className="mt-10">
        <WhatsAppShare
          productName={product.name}
          brand={brand?.name ?? ""}
          url={`${SITE_URL}/c/${category}/${slug}`}
        />
      </div>

      <section className="mt-12 border-t rule pt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-2">
            How we checked
          </div>
          {isLab && product.lab_report_url ? (
            <a
              href={product.lab_report_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-2xl tracking-tight text-[color:var(--lab)] underline decoration-[color:var(--lab)]/40 underline-offset-4 hover:decoration-[color:var(--lab)]"
            >
              Lab tested ✓
            </a>
          ) : (
            <div
              className={`font-display text-2xl tracking-tight ${
                isLab ? "text-[color:var(--lab)]" : ""
              }`}
            >
              {isLab ? "Lab tested ✓" : "Label reviewed"}
            </div>
          )}
          {isLab && (
            <p className="text-base text-[color:var(--ink-soft)] mt-2 leading-snug">
              A NABL certified lab tested this product.
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

      <FeedbackBlock
        productId={product.id}
        pathname={`/c/${category}/${slug}`}
        initialHelpful={helpful}
        initialUnhelpful={unhelpful}
      />

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
