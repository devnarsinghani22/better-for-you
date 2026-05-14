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

  // Paneer compound: the "paneer" slug is the parent; nest other "paneer-*"
  // slugs as variants underneath it.
  const paneerParent = list.find((c) => c.slug === "paneer");
  const paneerVariants = list
    .filter((c) => c.slug !== "paneer" && c.slug.startsWith("paneer-"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const paneerTotal =
    (paneerParent ? counts.get(paneerParent.id) ?? 0 : 0) +
    paneerVariants.reduce((s, c) => s + (counts.get(c.id) ?? 0), 0);

  // Hide variant slugs from top-level index — they live inside the parent card.
  const indexEntries = list.filter(
    (c) => !(c.slug !== "paneer" && c.slug.startsWith("paneer-")),
  );
  const grandTotal = Array.from(counts.values()).reduce((s, n) => s + n, 0);

  // Issue masthead date — refreshes every revalidation window.
  const issueDate = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative z-10">
      <SiteHeader />

      {/* HERO — magazine masthead */}
      <section>
        <div className="max-w-[1280px] mx-auto px-5 sm:px-10 pt-8 sm:pt-14 pb-14 sm:pb-24">
          {/* Masthead row */}
          <div className="flex items-center justify-between pb-5 sm:pb-7 border-b rule font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)]">
            <span>Issue · 01</span>
            <span className="hidden sm:inline text-[color:var(--ink-soft)]">
              {issueDate}
            </span>
            <span>{grandTotal} picks</span>
          </div>

          {/* Title + tagline */}
          <div className="mt-10 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8 items-end">
            <div className="lg:col-span-8 rise rise-1">
              <span className="inline-block bg-[color:var(--accent)] text-[color:var(--ink)] font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] px-3 py-1.5 mb-5 sm:mb-7 leading-none">
                Not sponsored
              </span>
              <h1 className="font-display font-medium leading-[0.9] tracking-[-0.025em] text-[11.5vw] sm:text-[9.5vw] lg:text-[7.2vw] text-[color:var(--ink)]">
                Better for You
                <br />
                <em className="italic font-light whitespace-nowrap">by Food Pharmer</em>
              </h1>
            </div>

            <div className="lg:col-span-4 lg:pb-3 rise rise-2">
              <p className="text-lg sm:text-xl leading-snug text-[color:var(--ink-soft)] max-w-md font-normal">
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
              <p className="mt-6 font-display italic text-2xl sm:text-3xl text-[color:var(--accent-deep)] leading-none">
                Label Padhega India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES — editorial index */}
      <section className="border-t rule">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-10 pt-10 sm:pt-16 pb-16 sm:pb-24">
          <div className="flex items-end justify-between mb-8 sm:mb-12 rise rise-3">
            <h2 className="font-display text-3xl sm:text-5xl tracking-[-0.02em] leading-none">
              The Index
            </h2>
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)]">
              {indexEntries.length} sections
            </span>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {indexEntries.map((c, i) => {
              const num = String(i + 1).padStart(2, "0");
              const isPaneer = c.slug === "paneer";
              const picks = isPaneer ? paneerTotal : counts.get(c.id) ?? 0;
              const totalEntries = indexEntries.length;
              const featured = isPaneer; // featured spans full width on tablet+

              return (
                <li
                  key={c.id}
                  className={`group rise rise-${Math.min(i + 1, 5)} ${
                    featured ? "sm:col-span-2" : ""
                  }`}
                >
                  <article className="bg-[color:var(--bg-elev)] border rule rounded-sm overflow-hidden hover:border-[color:var(--ink)] transition-colors h-full flex flex-col">
                    <Link href={`/c/${c.slug}`} className="block">
                      <div className="relative aspect-[16/10] sm:aspect-[16/11] bg-[color:var(--bg)] overflow-hidden">
                        {c.hero_image_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={c.hero_image_url}
                            alt={c.name}
                            loading={i === 0 ? "eager" : "lazy"}
                            decoding="async"
                            fetchPriority={i === 0 ? "high" : "auto"}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        )}
                        <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.28em] bg-[color:var(--bg)] text-[color:var(--ink)] px-2 py-1 leading-none border rule">
                          {num} / {String(totalEntries).padStart(2, "0")}
                        </div>
                        {isPaneer && (
                          <div className="absolute top-3 right-3 border-2 border-[color:var(--lab)] text-[color:var(--lab)] font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-1 leading-none bg-[color:var(--bg-elev)]">
                            Lab tested ✓
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-5 sm:p-7 flex-1 flex flex-col">
                      <Link href={`/c/${c.slug}`}>
                        <h3 className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-[0.95] text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors">
                          {c.name}
                        </h3>
                      </Link>

                      {isPaneer && paneerVariants.length > 0 ? (
                        <ul className="mt-6 border-t rule">
                          <li className="border-b rule">
                            <Link
                              href={`/c/paneer`}
                              className="flex items-center justify-between min-h-[52px] py-3 group/v"
                            >
                              <span className="font-display text-xl sm:text-2xl tracking-tight text-[color:var(--ink)] group-hover/v:text-[color:var(--accent-deep)] transition-colors truncate">
                                Regular
                              </span>
                              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)] group-hover/v:text-[color:var(--accent-deep)] transition-colors shrink-0 ml-3 whitespace-nowrap">
                                {counts.get(paneerParent?.id ?? -1) ?? 0} picks · View →
                              </span>
                            </Link>
                          </li>
                          {paneerVariants.map((v) => (
                            <li
                              key={v.id}
                              className="border-b rule last:border-b-0"
                            >
                              <Link
                                href={`/c/${v.slug}`}
                                className="flex items-center justify-between min-h-[52px] py-3 group/v"
                              >
                                <span className="font-display text-xl sm:text-2xl tracking-tight text-[color:var(--ink)] group-hover/v:text-[color:var(--accent-deep)] transition-colors whitespace-nowrap">
                                  {v.name.replace(/^Paneer · /, "")}
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)] group-hover/v:text-[color:var(--accent-deep)] transition-colors shrink-0 ml-3 whitespace-nowrap">
                                  {counts.get(v.id) ?? 0} picks · View →
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-auto pt-5 border-t rule flex items-center justify-between gap-3">
                          <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)]">
                            {picks} picks
                          </span>
                          <Link
                            href={`/c/${c.slug}`}
                            className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors"
                          >
                            View section →
                          </Link>
                        </div>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* CLOSING — the brand promise */}
      <section className="border-t rule bg-[color:var(--bg-elev)]/40">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-10 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-6 items-start">
            <div className="lg:col-span-7">
              <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)]">
                The fine print
              </p>
              <h2 className="mt-3 sm:mt-4 font-display text-3xl sm:text-5xl tracking-[-0.02em] leading-[1.02] max-w-[18ch]">
                No money from brands. Ever.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-base sm:text-lg leading-relaxed text-[color:var(--ink-soft)] max-w-[44ch]">
                Every product on this list earned its place by passing our
                rules. Nothing is here because a brand paid for it to be.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/method"
                  className="inline-flex items-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors min-h-[44px]"
                >
                  Read our method →
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-[color:var(--ink)] text-[color:var(--ink)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-[color:var(--ink)] hover:text-[color:var(--bg)] transition-colors min-h-[44px]"
                >
                  About →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
