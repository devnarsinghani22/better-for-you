import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const revalidate = 300;

export const metadata = {
  title: "Our method | Better for You by Food Pharmer",
  description:
    "How Food Pharmer reviews packaged foods. The rules, the process, and how often we re-check.",
};

export default async function MethodPage() {
  const sb = await createClient();
  const { data: categories } = await sb
    .from("categories")
    .select("id, slug, name, blurb")
    .eq("active", true)
    .order("display_order");

  const { data: rules } = await sb
    .from("category_rules")
    .select("id, code, description, category_id, display_order")
    .eq("active", true)
    .order("display_order");

  const byCat = new Map<number, NonNullable<typeof rules>>();
  for (const r of rules ?? []) {
    if (r.category_id !== null) {
      if (!byCat.has(r.category_id)) byCat.set(r.category_id, []);
      byCat.get(r.category_id)!.push(r);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="max-w-[1000px] mx-auto px-6 sm:px-10 py-16 relative z-10">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)] hover:text-[color:var(--accent-deep)]"
        >
          ← Home
        </Link>

        <h1 className="font-display text-5xl sm:text-7xl tracking-[-0.02em] leading-[0.95] mt-8">
          How we approve.
        </h1>
        <p className="mt-6 text-lg text-[color:var(--ink-soft)] max-w-2xl leading-relaxed">
          We do not take money to put a product on this site. We do not accept
          brand pitches. Every approval is saved with the source page from the
          day we read it.
        </p>

        <section className="mt-14">
          <h2 className="font-display text-3xl tracking-tight">Rules by category</h2>
          <p className="mt-2 text-[color:var(--ink-soft)] max-w-2xl">
            Every category has its own rules. A product has to pass the rules
            for its category to be approved.
          </p>
          <div className="mt-6 space-y-8">
            {(categories ?? []).map((c) => {
              const catRules = byCat.get(c.id) ?? [];
              if (catRules.length === 0) return null;
              return (
                <div key={c.id} className="border-t rule pt-6">
                  <Link
                    href={`/c/${c.slug}`}
                    className="font-display text-2xl hover:text-[color:var(--accent-deep)] transition-colors"
                  >
                    {c.name}
                  </Link>
                  <ul className="mt-3 space-y-2">
                    {catRules.map((r) => (
                      <li key={r.id} className="flex gap-3">
                        <span aria-hidden className="text-[color:var(--lab)] font-mono shrink-0">✓</span>
                        <span className="text-[color:var(--ink-soft)] leading-relaxed">{r.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-14 border-t rule pt-10">
          <h2 className="font-display text-3xl tracking-tight">The process</h2>
          <ol className="mt-6 space-y-6 max-w-2xl">
            <li>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent-deep)]">Step 01</div>
              <h3 className="font-display text-xl mt-1">Pick a product</h3>
              <p className="text-[color:var(--ink-soft)] mt-1">
                We look at packaged foods sold in India. We start with categories
                that people buy a lot of.
              </p>
            </li>
            <li>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent-deep)]">Step 02</div>
              <h3 className="font-display text-xl mt-1">Read the label</h3>
              <p className="text-[color:var(--ink-soft)] mt-1">
                We pull the ingredient list from the brand website or an
                e-commerce listing. We save a screenshot of that page on the day
                we read it.
              </p>
            </li>
            <li>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent-deep)]">Step 03</div>
              <h3 className="font-display text-xl mt-1">Run the rules</h3>
              <p className="text-[color:var(--ink-soft)] mt-1">
                We check the product against its category&rsquo;s rules. We
                also check the brand. We do not approve products from brands
                that compete with Only What&rsquo;s Needed (the brand by Food
                Pharmer).
              </p>
            </li>
            <li>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent-deep)]">Step 04</div>
              <h3 className="font-display text-xl mt-1">Food Pharmer signs off</h3>
              <p className="text-[color:var(--ink-soft)] mt-1">
                Food Pharmer reviews every product before it goes on this site.
                Nothing goes live without that.
              </p>
            </li>
            <li>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent-deep)]">Step 05</div>
              <h3 className="font-display text-xl mt-1">Re-check every six months</h3>
              <p className="text-[color:var(--ink-soft)] mt-1">
                Brands sometimes change recipes. We re-read every approved
                product&rsquo;s label every six months. If something has
                changed, we either re-approve or remove the product.
              </p>
            </li>
          </ol>
        </section>

        <section className="mt-14 border-t rule pt-10">
          <h2 className="font-display text-3xl tracking-tight">Find a mistake?</h2>
          <p className="mt-3 text-[color:var(--ink-soft)] max-w-2xl">
            We try to be careful but we are human. If you think a product on
            this site does not actually meet the rules, please tell us. DM us
            on{" "}
            <a
              href="https://instagram.com/foodpharmer"
              target="_blank"
              rel="noopener"
              className="underline hover:text-[color:var(--accent-deep)]"
            >
              Instagram
            </a>{" "}
            and we will look at it the same week.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
