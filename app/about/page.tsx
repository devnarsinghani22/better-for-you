import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "About | Food Pharmer Approved",
  description:
    "What Food Pharmer Approved is, why it exists, and who is behind it.",
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

        <p className="mt-14 font-display italic text-2xl text-[color:var(--accent-deep)]">
          Label Padhega India.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
