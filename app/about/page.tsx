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
            Food Pharmer has spent years showing what is really inside those
            packs. This site is a small list of products that pass our rules.
            You can buy them without having to read the label every time.
          </p>
        </div>

        <section className="mt-12 border-t rule pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            Who is behind this
          </p>
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight mt-3 leading-tight">
            Food Pharmer, with a team of qualified nutritionists.
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
            ) and a team of qualified nutritionists. We read the label, run our
            rules, and where it makes sense we also send the product to a
            certified lab. Nothing goes on this list until that team signs off.
          </p>
        </section>

        <div className="mt-10 space-y-6 text-lg text-[color:var(--ink-soft)] leading-relaxed">
          <p>
            We do not approve every clean-looking pack. We do not approve
            products from brands that compete with our own brand,{" "}
            <a
              href="https://onlywhatsneeded.in"
              target="_blank"
              rel="noopener"
              className="underline hover:text-[color:var(--accent-deep)]"
            >
              Only What&rsquo;s Needed
            </a>
            . We also do not approve a product just because the brand asked us
            to.
          </p>
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
            {[
              {
                q: "Are brands paying you to be on this list?",
                a: "No. We do not take money, free product, or any other consideration from brands in exchange for an approval. If a brand pitches us, we still run our own checks.",
              },
              {
                q: "How do I know I can trust this?",
                a: "Two things. One, every product links to the page on the brand's own site where we read the label, so you can verify it yourself. Two, where we ran a chemistry test (e.g. paneer), the actual lab PDF is attached to the product page.",
              },
              {
                q: "Why isn't my favourite brand here?",
                a: "Probably one of three reasons. The product fails one of our rules (a hidden ingredient like maida or palm oil, or an artificial something). Or we haven't checked it yet. Or it's from a brand that competes with our own brand, Only What's Needed — we do not approve those, to be fair to the reader.",
              },
              {
                q: "What is the difference between 'lab tested' and 'label reviewed'?",
                a: "Label reviewed means we read the ingredient list off the pack. Lab tested means we also paid a certified lab to run a chemistry test on the product. Lab tests catch things the label can hide.",
              },
              {
                q: "How often do you re-check?",
                a: "Every six months. Brands change recipes without changing the front of the pack. If a product no longer passes, we mark it Retracted and remove it from the list.",
              },
              {
                q: "I bought a pack and the ingredients on it look different from your site.",
                a: "Tell us. The contact form goes straight to us. We will re-check and update the page within a few days.",
              },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="font-display text-xl sm:text-2xl tracking-tight text-[color:var(--ink)] leading-snug">
                  {item.q}
                </h3>
                <p className="mt-2 text-base text-[color:var(--ink-soft)] leading-relaxed">
                  {item.a}
                </p>
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
