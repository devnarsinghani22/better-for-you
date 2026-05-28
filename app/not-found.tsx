import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Not found | Better for You by Food Pharmer",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none max-w-[800px] mx-auto px-6 sm:px-10 py-24 relative z-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
          Page 404
        </p>
        <h1 className="mt-4 font-display text-6xl sm:text-7xl tracking-[-0.02em] leading-[0.95]">
          Couldn&rsquo;t find that.
        </h1>
        <p className="mt-6 text-lg text-[color:var(--ink-soft)] leading-relaxed max-w-lg">
          That page doesn&rsquo;t exist, or the product was retracted. The
          easiest fix is usually to go back to the homepage and start there.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-5 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors"
          >
            ← Back to home
          </Link>
          <Link
            href="/criteria"
            className="inline-flex items-center gap-2 border-b border-[color:var(--ink)] pb-1 font-mono text-xs uppercase tracking-[0.22em] hover:text-[color:var(--accent-deep)] hover:border-[color:var(--accent-deep)] transition-colors"
          >
            See our criteria →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
