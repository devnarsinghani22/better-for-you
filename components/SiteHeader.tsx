import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b rule sticky top-0 z-30 bg-[color:var(--bg)]/90 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-3 flex items-center gap-3 sm:gap-5 text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em]">
        <Link
          href="/"
          className="text-[color:var(--ink-soft)] hover:text-[color:var(--accent-deep)] transition-colors shrink-0"
        >
          <span className="hidden sm:inline">Better for You by Food Pharmer</span>
          <span className="sm:hidden">Better for You</span>
        </Link>

        <form
          action="/search"
          method="GET"
          role="search"
          className="flex-1 flex items-center max-w-md"
        >
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            id="site-search"
            type="search"
            name="q"
            placeholder="Search products, brands…"
            className="w-full bg-[color:var(--bg-elev)] border border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm px-3 py-1.5 text-[12px] sm:text-xs uppercase tracking-[0.16em] text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors"
          />
        </form>

        <nav className="hidden md:flex gap-4 text-[color:var(--ink-mute)] shrink-0">
          <Link href="/method" className="hover:text-[color:var(--accent-deep)] transition-colors">
            Method
          </Link>
          <Link href="/about" className="hover:text-[color:var(--accent-deep)] transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-[color:var(--accent-deep)] transition-colors">
            Contact
          </Link>
        </nav>

        <a
          href="https://instagram.com/foodpharmer"
          className="text-[color:var(--ink-soft)] hover:text-[color:var(--accent-deep)] transition-colors shrink-0 hidden sm:inline-block"
          target="_blank"
          rel="noopener"
        >
          @foodpharmer →
        </a>
      </div>
    </header>
  );
}
