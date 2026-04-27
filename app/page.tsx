import { createClient } from "@/lib/supabase/server";

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

const categoryNumber = (i: number) => String(i + 1).padStart(2, "0");

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, slug, name, blurb")
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
              would actually
              <span className="relative inline-block">
                {" "}buy.
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-[6px] bg-[color:var(--accent)]/70 -z-10 translate-y-[2px]"
                />
              </span>
            </h1>
          </div>

          <div className="lg:col-span-4 lg:pb-3 rise rise-2">
            <p className="text-lg sm:text-xl leading-relaxed text-[color:var(--ink-soft)] max-w-md font-normal">
              A small, growing catalogue of packaged foods that meet our
              clean-label criteria. We read the labels so you don&rsquo;t have
              to — and we link to the source every time.
            </p>
            <p className="mt-6 font-display italic text-2xl text-[color:var(--accent-deep)]">
              Label padhega India.
            </p>
          </div>
        </div>
      </section>

      {/* Rule strip — marquee */}
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
            <article className="lg:col-span-7 lg:row-span-2 group relative bg-[color:var(--bg-elev)] border rule rounded-sm p-8 sm:p-12 flex flex-col justify-between min-h-[420px] overflow-hidden rise rise-3">
              {/* Lab-tested stamp */}
              <div className="absolute top-6 right-6 stamp">
                <div className="border-2 border-[color:var(--lab)] text-[color:var(--lab)] font-mono text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 leading-none">
                  Lab-Tested ✓
                </div>
              </div>

              <div>
                <span className="font-display italic text-[color:var(--ink-mute)] text-xl mb-2 block">
                  No. {categoryNumber(list.indexOf(featured))}
                </span>
                <h3 className="font-display text-6xl sm:text-7xl lg:text-8xl tracking-[-0.025em] leading-[0.95] mb-6">
                  {featured.name}
                </h3>
                <p className="text-lg sm:text-xl leading-relaxed text-[color:var(--ink-soft)] max-w-lg">
                  {featured.blurb}
                </p>
              </div>

              <div className="mt-10 flex items-end justify-between gap-6">
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] leading-relaxed">
                  Criteria<br />
                  <span className="text-[color:var(--ink-soft)] normal-case tracking-normal font-body text-sm">
                    Only milk + an acidic agent (lime, citric, or vinegar).
                    Verified by Eurofins lab assay.
                  </span>
                </div>
                <a
                  href={`/c/${featured.slug}`}
                  className="shrink-0 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink)] border-b border-[color:var(--ink)] pb-1 hover:text-[color:var(--accent-deep)] hover:border-[color:var(--accent-deep)] transition-colors"
                >
                  View approved
                  <span aria-hidden>→</span>
                </a>
              </div>
            </article>
          )}

          {/* Other 4 cards */}
          {others.map((c, i) => {
            const idx = list.indexOf(c);
            return (
              <article
                key={c.id}
                className={`lg:col-span-5 group relative bg-[color:var(--bg-elev)] border rule rounded-sm p-7 sm:p-8 flex flex-col justify-between min-h-[200px] hover:border-[color:var(--ink)] transition-colors rise rise-${Math.min(i + 4, 5)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] block mb-2">
                      No. {categoryNumber(idx)}
                    </span>
                    <h3 className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-tight mb-2">
                      {c.name}
                    </h3>
                    <p className="text-[color:var(--ink-soft)] text-base leading-snug">
                      {c.blurb}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                    Label-tested
                  </span>
                  <a
                    href={`/c/${c.slug}`}
                    className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink)] hover:text-[color:var(--accent-deep)] transition-colors"
                  >
                    View →
                  </a>
                </div>
              </article>
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
              No paid placements. No brand pitches accepted. Every approval is
              recorded with the source page on the day we read it.
            </p>
          </div>
          <ol className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-8">
            {[
              {
                num: "01",
                title: "Read the label.",
                body: "We pull the ingredient list from the brand site or e-commerce listing — and we screenshot the page at retrieval.",
              },
              {
                num: "02",
                title: "Run the rules.",
                body: "Per-category criteria + universal rules (no maida, no palm oil, no artificial anything). Brand-level exclusions for our competitors.",
              },
              {
                num: "03",
                title: "Revant signs off.",
                body: "Every product is reviewed personally by Revant before it appears here. Re-verified every six months — formulations change.",
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
              Edited by Revant Himatsingka. A small list of clean-label
              packaged foods, kept honest.
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
            <span>© 2026 · v1 · made in Mumbai</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
