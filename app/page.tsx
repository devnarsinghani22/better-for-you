import { createClient } from "@/lib/supabase/server";
import { getLiveCountByCategory } from "@/lib/products/queries";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, slug, name, blurb, hero_image_url")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="p-12">
        <p className="font-mono text-sm text-[color:var(--danger)]">
          Could not load: {error.message}
        </p>
      </main>
    );
  }

  const list = categories ?? [];
  const counts = await getLiveCountByCategory();

  const paneerSlugOrder = ["paneer", "paneer-high-protein", "paneer-low-fat"];
  const paneerVariants = paneerSlugOrder
    .map((s) => list.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const paneerHero = paneerVariants[0];
  const variantShortLabel: Record<string, string> = {
    "paneer": "Regular",
    "paneer-high-protein": "High Protein",
    "paneer-low-fat": "Low Fat",
  };
  const paneerTotal = paneerVariants.reduce(
    (sum, c) => sum + (counts.get(c.id) ?? 0),
    0,
  );

  return (
    <div className="relative z-10">
      <SiteHeader />

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-10 pt-10 sm:pt-24 pb-4 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-6 sm:gap-y-8 items-end">
          <div className="lg:col-span-8 rise rise-1">
            <span className="inline-block bg-[color:var(--accent)] text-[color:var(--ink)] font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] px-3 py-1.5 mb-5 sm:mb-7 leading-none">
              Not sponsored
            </span>
            <h1 className="font-display font-medium leading-[0.92] tracking-[-0.02em] text-[11.5vw] sm:text-[10vw] lg:text-[7.2vw] text-[color:var(--ink)]">
              Better for You
              <br />
              <em className="italic font-light">by Food Pharmer</em>
            </h1>
          </div>

          <div className="lg:col-span-4 lg:pb-3 rise rise-2">
            <p className="text-lg sm:text-xl leading-relaxed text-[color:var(--ink-soft)] max-w-md font-normal">
              We analyse ingredient lists and nutrition labels to shortlist
              products that are better for you.
            </p>
            <p className="mt-5 text-sm text-[color:var(--ink-mute)] leading-relaxed max-w-md">
              Reviewed by{" "}
              <a
                href="https://instagram.com/foodpharmer"
                target="_blank"
                rel="noopener"
                className="text-[color:var(--ink-soft)] underline decoration-[color:var(--ink-mute)] underline-offset-2 hover:text-[color:var(--accent-deep)]"
              >
                Food Pharmer
              </a>
              , plus a team of nutrition experts and researchers. Not
              sponsored by any brand on this list.
            </p>
            <p className="mt-5 font-display italic text-2xl text-[color:var(--accent-deep)]">
              Label Padhega India.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-10 pt-4 sm:pt-10 pb-12 sm:pb-24">
        <div className="mb-8 sm:mb-10 rise rise-3">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
            Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {list.map((c, i) => {
            // Skip the two paneer variant slugs — they get rendered inside
            // the parent "paneer" featured card below.
            if (c.slug === "paneer-high-protein" || c.slug === "paneer-low-fat") {
              return null;
            }

            // Featured row for Paneer + its three variants, full-width.
            if (c.slug === "paneer" && paneerHero) {
              return (
                <article
                  key={c.id}
                  className={`sm:col-span-2 relative bg-[color:var(--bg-elev)] border rule rounded-sm overflow-hidden rise rise-${Math.min(i + 1, 5)}`}
                >
                  <div className="flex flex-row items-stretch min-h-[220px] sm:min-h-[260px]">
                    <div className="relative w-[44%] sm:w-[40%] shrink-0 self-stretch overflow-hidden bg-[color:var(--bg)]">
                      {paneerHero.hero_image_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={paneerHero.hero_image_url}
                          alt="Paneer"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-3 left-3 z-10">
                        <div className="border-2 border-[color:var(--lab)] text-[color:var(--lab)] font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-1 leading-none bg-[color:var(--bg-elev)]">
                          Lab tested ✓
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 p-5 sm:p-7 flex flex-col">
                      <h3 className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-[0.95]">
                        Paneer
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mt-2 mb-3 sm:mb-4">
                        {paneerTotal} picks
                      </p>

                      <ul className="mt-auto border-t rule">
                        {paneerVariants.map((v) => {
                          return (
                            <li key={v.id} className="border-b rule last:border-b-0">
                              <Link
                                href={`/c/${v.slug}`}
                                className="group flex items-center justify-between py-2.5 sm:py-3 hover:text-[color:var(--accent-deep)] transition-colors"
                              >
                                <span className="font-display text-base sm:text-xl tracking-[-0.01em] leading-tight text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors whitespace-nowrap">
                                  {variantShortLabel[v.slug] ?? v.name}
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors shrink-0 ml-3">
                                  View →
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            }

            // Default card
            const n = counts.get(c.id) ?? 0;
            return (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className={`group relative bg-[color:var(--bg-elev)] border rule rounded-sm flex flex-col min-h-[220px] overflow-hidden hover:border-[color:var(--ink)] transition-colors rise rise-${Math.min(i + 1, 5)} block`}
              >
                <div className="flex flex-1">
                  {c.hero_image_url && (
                    <div className="relative w-[44%] shrink-0 overflow-hidden bg-[color:var(--bg)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.hero_image_url}
                        alt={c.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-tight">
                        {c.name}
                      </h3>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                        {n} picks
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
