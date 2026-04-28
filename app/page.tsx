import { createClient } from "@/lib/supabase/server";
import { getLiveCountByCategory } from "@/lib/products/queries";
import Link from "next/link";

export const revalidate = 60;

const ruleStrip = [
  "no maida",
  "no palm oil",
  "no artificial colors",
  "no artificial flavours",
  "no artificial sweeteners",
  "no maltodextrin",
  "no thickeners",
  "added sugar capped",
  "label verified",
  "source cited",
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, slug, name, blurb, hero_image_url")
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (error) {
    return (
      <main className="p-12">
        <p className="font-mono text-sm text-[color:var(--danger)]">
          Could not load: {error.message}
        </p>
      </main>
    );
  }

  // Pick the lab-tested category to feature (paneer); fall back to first
  const list = categories ?? [];
  const featured = list.find((c) => c.slug === "paneer") ?? list[0];
  const others = list.filter((c) => c.slug !== featured?.slug);
  const counts = await getLiveCountByCategory();

  return (
    <div className="relative z-10">
      {/* Top band */}
      <header className="border-b rule">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-3 flex items-center justify-between text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em]">
          <span className="text-[color:var(--ink-soft)]">
            Food Pharmer · Approved
          </span>
          <span className="hidden sm:inline text-[color:var(--ink-mute)]">
            Issue No. 01 · April 2026
          </span>
          <a
            href="https://instagram.com/foodpharmer"
            className="text-[color:var(--ink-soft)] hover:text-[color:var(--accent-deep)] transition-colors"
            target="_blank"
            rel="noopener"
          >
            @foodpharmer →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-10 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8 items-end">
          <div className="lg:col-span-8 rise rise-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-6">
              A label-literacy publication · {list.length} categories
            </p>
            <h1 className="font-display font-medium leading-[0.92] tracking-[-0.02em] text-[14vw] sm:text-[10vw] lg:text-[7.2vw] text-[color:var(--ink)]">
              Products
              <br />
              <em className="italic font-light">Food Pharmer</em>
              <br />
              would actually{" "}
              <span className="relative inline-block">
                buy.
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-[6px] bg-[color:var(--accent)]/70 -z-10 translate-y-[2px]"
                />
              </span>
            </h1>
          </div>

          <div className="lg:col-span-4 lg:pb-3 rise rise-2">
            <p className="text-lg sm:text-xl leading-relaxed text-[color:var(--ink-soft)] max-w-md font-normal">
              A small list of packaged foods that meet Food Pharmer&rsquo;s
              criteria. We read the ingredients so you don&rsquo;t have to.
              Every product links back to where we read it.
            </p>
            <p className="mt-6 font-display italic text-2xl text-[color:var(--accent-deep)]">
              Label Padhega India.
            </p>
          </div>
        </div>
      </section>

      {/* Rule strip marquee */}
      <section className="border-y rule bg-[color:var(--bg-elev)]/50 overflow-hidden rise rise-3">
        <div className="flex whitespace-nowrap py-4 marquee-track">
          {[...ruleStrip, ...ruleStrip, ...ruleStrip].map((r, i) => (
            <span
              key={i}
              className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-soft)] mx-7 flex items-center gap-7"
            >
              {r}
              <span className="text-[color:var(--accent)]" aria-hidden>◆</span>
            </span>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1280px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="flex items-baseline justify-between mb-10 rise rise-3">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
            The departments
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            v1 · {list.length} live
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured card */}
          {featured && (
            <article className="lg:col-span-7 lg:row-span-2 group relative bg-[color:var(--bg-elev)] border rule rounded-sm flex flex-col min-h-[420px] overflow-hidden rise rise-3">
              {featured.hero_image_url && (
                <div className="relative h-[260px] sm:h-[340px] w-full overflow-hidden bg-[color:var(--bg)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.hero_image_url}
                    alt={featured.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute top-5 right-5 stamp z-10">
                    <div className="border-2 border-[color:var(--lab)] text-[color:var(--lab)] font-mono text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 leading-none bg-[color:var(--bg-elev)]">
                      Lab-Tested ✓
                    </div>
                  </div>
                </div>
              )}

              <div className="p-8 sm:p-12 flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] block mb-3">
                    Featured · {counts.get(featured.id) ?? 0} approved
                  </span>
                  <h3 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-[-0.025em] leading-[0.95] mb-5">
                    {featured.name}
                  </h3>
                  <p className="text-lg leading-relaxed text-[color:var(--ink-soft)] max-w-lg">
                    {featured.blurb}
                  </p>
                </div>

                <div className="mt-8 flex items-end justify-between gap-6">
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] leading-relaxed">
                    Criteria<br />
                    <span className="text-[color:var(--ink-soft)] normal-case tracking-normal font-body text-sm">
                      Only milk + an acidic agent (lime, citric, or vinegar).
                      Verified by Eurofins lab assay.
                    </span>
                  </div>
                  <Link
                    href={`/c/${featured.slug}`}
                    className="shrink-0 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink)] border-b border-[color:var(--ink)] pb-1 hover:text-[color:var(--accent-deep)] hover:border-[color:var(--accent-deep)] transition-colors"
                  >
                    {counts.get(featured.id) ?? 0} approved
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* Other 4 cards */}
          {others.map((c, i) => {
            const n = counts.get(c.id) ?? 0;
            return (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className={`lg:col-span-5 group relative bg-[color:var(--bg-elev)] border rule rounded-sm flex flex-col min-h-[220px] overflow-hidden hover:border-[color:var(--ink)] transition-colors rise rise-${Math.min(i + 4, 5)} block`}
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
                      <h3 className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-tight mb-2">
                        {c.name}
                      </h3>
                      <p className="text-[color:var(--ink-soft)] text-sm sm:text-base leading-snug">
                        {c.blurb}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                        {n} approved
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

      {/* How we approve */}
      <section className="border-t rule">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-10">
          <div className="lg:col-span-4">
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight leading-[0.95]">
              How we approve.
            </h2>
            <p className="mt-4 text-[color:var(--ink-soft)] max-w-sm">
              No paid spots. No brand pitches. Every approval is saved with the
              source page from the day we read it.
            </p>
          </div>
          <ol className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-8">
            {[
              {
                num: "01",
                title: "Read the label.",
                body: "We pull the ingredient list from the brand website or an e-commerce listing. We also save a screenshot of that page on the day we read it.",
              },
              {
                num: "02",
                title: "Run the rules.",
                body: "We check the product against the rules for its category. Plus our basic rules: no maida, no palm oil, no artificial anything.",
              },
              {
                num: "03",
                title: "Food Pharmer signs off.",
                body: "Food Pharmer reviews every product before it goes on this site. We re-check each product every six months. Brands sometimes change recipes.",
              },
            ].map((step, i) => (
              <li key={step.num} className={`rise rise-${(i % 5) + 1}`}>
                <div className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent-deep)] mb-3">
                  Step {step.num}
                </div>
                <h3 className="font-display text-2xl mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-[color:var(--ink-soft)] text-sm leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t rule mt-auto">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div>
            <p className="font-display text-2xl tracking-tight">
              Food Pharmer Approved
            </p>
            <p className="mt-2 text-sm text-[color:var(--ink-soft)] max-w-sm">
              By Food Pharmer. A small list of packaged foods we would actually
              buy ourselves.
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            <a
              href="https://instagram.com/foodpharmer"
              target="_blank"
              rel="noopener"
              className="hover:text-[color:var(--accent-deep)] transition-colors"
            >
              instagram · @foodpharmer
            </a>
            <span>© 2026 · v1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
