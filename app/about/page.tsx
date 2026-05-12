import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "About | Better for You by Food Pharmer",
  description:
    "What Better for You by Food Pharmer is, why it exists, and who is behind it.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-[800px] mx-auto px-6 sm:px-10 py-16 relative z-10">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)] hover:text-[color:var(--accent-deep)]"
        >
          ← Home
        </Link>

        <h1 className="font-display text-5xl sm:text-7xl tracking-[-0.02em] leading-[0.95] mt-8">
          About this site.
        </h1>

        <div className="mt-10 space-y-6 text-lg text-[color:var(--ink-soft)] leading-relaxed">
          <p>
            Most packaged foods in India sell themselves with claims on the
            front of the pack. The honest story is on the back, in the
            ingredient list.
          </p>
          <p>
            Food Pharmer&rsquo;s mission has always been simple: make every
            Indian health-literate. Years went into studying nutrition science
            and the marketing tricks food brands use to sell to you. More
            years went into translating that work into reels and videos
            &mdash; how to read a label, why a claim on the front of a pack
            rarely matches the ingredient list on the back, what nutrition
            fundamentals actually matter.
          </p>
          <p>
            The next question always came back:{" "}
            <em>OK, but what should I actually buy?</em> This growing list is
            the answer. Every product here has been vetted by the team, eaten
            by Food Pharmer, and earned a place on his own family&rsquo;s
            shelf.
          </p>
        </div>

        <section className="mt-12 border-t rule pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            Who is behind this
          </p>
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight mt-3 leading-tight">
            Food Pharmer, plus a team of nutrition experts and researchers.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[color:var(--ink-soft)] leading-relaxed">
            Every product on this site is reviewed by Food Pharmer (
            <a
              href="https://instagram.com/foodpharmer"
              target="_blank"
              rel="noopener"
              className="underline hover:text-[color:var(--accent-deep)]"
            >
              @foodpharmer
            </a>
            ), plus a team of nutrition experts and researchers. We read the
            label, run our rules, and in a few cases, we send products for
            lab-testing. Nothing goes on this list until the team has vetted
            the products and Food Pharmer has personally reviewed them too.
          </p>
        </section>

        <section className="mt-12 border-t rule pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            What we don&rsquo;t do
          </p>
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight mt-3 leading-tight">
            No money, no pitches, no shortcuts.
          </h2>
          <ul className="mt-6 space-y-3 text-base sm:text-lg text-[color:var(--ink-soft)] leading-relaxed">
            <li className="flex gap-3">
              <span aria-hidden className="text-[color:var(--accent-deep)] shrink-0">·</span>
              <span>
                We don&rsquo;t take money, free product, or any other
                consideration from brands in exchange for being on this list.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="text-[color:var(--accent-deep)] shrink-0">·</span>
              <span>
                We don&rsquo;t approve products from brands that compete with
                our own brand,{" "}
                <a
                  href="https://onlywhatsneeded.in"
                  target="_blank"
                  rel="noopener"
                  className="underline hover:text-[color:var(--accent-deep)]"
                >
                  Only What&rsquo;s Needed
                </a>
                .
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="text-[color:var(--accent-deep)] shrink-0">·</span>
              <span>
                We don&rsquo;t approve a product just because the brand asked
                us to.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="text-[color:var(--accent-deep)] shrink-0">·</span>
              <span>
                We don&rsquo;t approve a pack just because it looks clean on
                the front &mdash; we check the ingredient list and the
                nutrition panel every time.
              </span>
            </li>
          </ul>
        </section>

        <div className="mt-10 space-y-6 text-lg text-[color:var(--ink-soft)] leading-relaxed">
          <p>
            Want to know how we decide?{" "}
            <Link href="/method" className="underline hover:text-[color:var(--accent-deep)]">
              Read our method
            </Link>
            .
          </p>
          <p>
            Want to flag a product or send us a tip?{" "}
            <Link href="/contact" className="underline hover:text-[color:var(--accent-deep)]">
              Get in touch
            </Link>
            .
          </p>
        </div>

        <section id="faqs" className="mt-16 border-t rule pt-10 scroll-mt-24">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
            FAQs
          </h2>
          <p className="text-sm text-[color:var(--ink-soft)] mt-2">
            The questions we get most often. Short, blunt answers.
          </p>

          <div className="mt-8 space-y-7">
            {(
              [
                {
                  q: "Do you have to pay a fee to be on this list?",
                  a: (
                    <>
                      No. We do not take money, free product, or any other
                      consideration from brands in exchange for being on this
                      list. In fact, everything on this list is something Food
                      Pharmer hand-picked. If brands come and pitch to be on
                      this list, they still have to meet every criterion
                      outlined on our{" "}
                      <Link
                        href="/method"
                        className="underline hover:text-[color:var(--accent-deep)]"
                      >
                        method page
                      </Link>
                      .
                    </>
                  ),
                },
                {
                  q: "How do I know I can trust this?",
                  a: (
                    <>
                      Two reasons:
                      <ul className="mt-3 space-y-2 list-disc pl-5">
                        <li>
                          Every product links to the brand&rsquo;s own page
                          where we read the label, so you can verify it
                          yourself.
                        </li>
                        <li>
                          Wherever we did a lab test, the actual test results
                          are attached to the product page as a PDF.
                        </li>
                      </ul>
                    </>
                  ),
                },
                {
                  q: "Why isn't my favourite brand here?",
                  a: (
                    <>
                      There could be a few reasons. Either the product
                      didn&rsquo;t meet our criteria, or the team hasn&rsquo;t
                      checked it yet &mdash; feel free to{" "}
                      <Link
                        href="/contact"
                        className="underline hover:text-[color:var(--accent-deep)]"
                      >
                        contact us
                      </Link>{" "}
                      if you have product suggestions. Or the product is in a
                      category that competes with Food Pharmer&rsquo;s{" "}
                      <a
                        href="https://onlywhatsneeded.in"
                        target="_blank"
                        rel="noopener"
                        className="underline hover:text-[color:var(--accent-deep)]"
                      >
                        Only What&rsquo;s Needed
                      </a>{" "}
                      initiative, which is a conflict of interest, so we leave
                      those out.
                    </>
                  ),
                },
                {
                  q: "What is the difference between 'lab tested' and 'label reviewed'?",
                  a: (
                    <>
                      Label reviewed means we read the ingredient list off the
                      pack. Lab tested means we also paid a certified lab to
                      run tests on the product &mdash; lab tests catch things
                      the label can hide. But lab tests are also very
                      expensive, which is why at this time we are unable to
                      lab test every category.
                    </>
                  ),
                },
                {
                  q: "What if a company changes its formulation?",
                  a: (
                    <>
                      Food companies update formulations and nutrition labels
                      even when the front of the pack still looks the same.
                      So we re-check listings every six months. If a
                      formulation change means a product no longer meets our
                      criteria, we mark it as &ldquo;Retracted&rdquo; and
                      remove it from the site.
                    </>
                  ),
                },
                {
                  q: "I bought a product that's listed on your site but the ingredients look different. Why?",
                  a: (
                    <>
                      Use the{" "}
                      <Link
                        href="/contact"
                        className="underline hover:text-[color:var(--accent-deep)]"
                      >
                        contact form
                      </Link>{" "}
                      to let us know right away. Our team will look into it
                      and update the product page as needed.
                    </>
                  ),
                },
              ] as { q: string; a: React.ReactNode }[]
            ).map((item, i) => (
              <div key={i}>
                <h3 className="font-display text-xl sm:text-2xl tracking-tight text-[color:var(--ink)] leading-snug">
                  {item.q}
                </h3>
                <div className="mt-2 text-base text-[color:var(--ink-soft)] leading-relaxed">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-16 font-display italic text-2xl text-[color:var(--accent-deep)]">
          Label Padhega India.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
