import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const revalidate = 300;

export const metadata = {
  title: "Criteria | Better for You by Food Pharmer",
  description:
    "The rules every product must pass to make it onto the list, broken down by category.",
};

export default async function CriteriaPage() {
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

        <section className="mt-14">
          <h1 className="font-display text-3xl tracking-tight">Rules by category</h1>
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

        <section id="faqs" className="mt-16 border-t rule pt-10 scroll-mt-24">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight">FAQs</h2>
          <p className="text-sm text-[color:var(--ink-soft)] mt-2">
            The questions we get most often. Short, blunt answers.
          </p>

          <div className="mt-8 space-y-7">
            <div>
              <h3 className="font-display text-xl sm:text-2xl tracking-tight text-[color:var(--ink)] leading-snug">
                How do I know I can trust this?
              </h3>
              <div className="mt-2 text-base text-[color:var(--ink-soft)] leading-relaxed">
                Two reasons:
                <ul className="mt-3 space-y-2 list-disc pl-5">
                  <li>
                    Every product links to the brand&rsquo;s own page where we read the label, so
                    you can verify it yourself.
                  </li>
                  <li>
                    Wherever we did a lab test, the actual test results are attached to the product
                    page as a PDF.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl sm:text-2xl tracking-tight text-[color:var(--ink)] leading-snug">
                What is the difference between &lsquo;lab tested&rsquo; and &lsquo;label reviewed&rsquo;?
              </h3>
              <p className="mt-2 text-base text-[color:var(--ink-soft)] leading-relaxed">
                Label reviewed means we read the ingredient list off the pack. Lab tested means we
                also paid a certified lab to run tests on the product &mdash; lab tests catch things
                the label can hide. But lab tests are also very expensive, which is why at this time
                we are unable to lab test every category.
              </p>
            </div>

            <div>
              <h3 className="font-display text-xl sm:text-2xl tracking-tight text-[color:var(--ink)] leading-snug">
                I bought a product that&rsquo;s listed on your site but the ingredients look different. Why?
              </h3>
              <p className="mt-2 text-base text-[color:var(--ink-soft)] leading-relaxed">
                Email us at{" "}
                <a
                  href="mailto:betterforyou@foodpharmer.net?subject=Listing%20ingredients%20mismatch"
                  className="underline hover:text-[color:var(--accent-deep)]"
                >
                  betterforyou@foodpharmer.net
                </a>{" "}
                or DM us on{" "}
                <a
                  href="https://instagram.com/foodpharmer"
                  target="_blank"
                  rel="noopener"
                  className="underline hover:text-[color:var(--accent-deep)]"
                >
                  Instagram
                </a>{" "}
                and let us know right away. Our team will look into it and update the product page
                as needed.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
