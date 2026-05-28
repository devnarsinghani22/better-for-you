import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchBox from "@/components/SearchBox";

export const metadata = {
  title: "Not found | Better for You by Food Pharmer",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        tabIndex={-1}
        className="outline-none max-w-[800px] mx-auto px-6 sm:px-10 py-24 relative z-10"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
          Page 404
        </p>
        <h1 className="mt-4 font-display text-6xl sm:text-7xl tracking-[-0.02em] leading-[0.95]">
          Couldn&rsquo;t find that.
        </h1>
        <p className="mt-6 text-lg text-[color:var(--ink-soft)] leading-relaxed max-w-lg">
          That page doesn&rsquo;t exist, or the product was retracted. Try
          searching — most of the time the page just moved.
        </p>

        {/* Recovery surface — the cheapest way to keep a dead-link visit
            alive. SearchBox is the same component as the header search, so
            results dropdown + keyboard behaviour is identical. */}
        <div className="mt-10 max-w-md">
          <SearchBox />
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-5 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors"
          >
            ← Back to home
          </Link>
          <Link
            href="/b"
            className="inline-flex items-center gap-2 border rule px-5 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:text-[color:var(--accent-deep)] transition-colors"
          >
            Browse brands →
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
