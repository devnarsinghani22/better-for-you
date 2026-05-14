import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b rule sticky top-0 z-30 bg-[color:var(--bg)]/90 backdrop-blur-md">
      <div className="bg-[color:var(--ink)] text-[color:var(--bg)] py-1.5 text-center font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em]">
        Not sponsored · Not paid · Not affiliated
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-5 text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em]">
        <Link
          href="/"
          className="text-[color:var(--ink-soft)] hover:text-[color:var(--accent-deep)] transition-colors shrink-0 self-start sm:self-center text-[12px] sm:text-xs"
        >
          Better for You by Food Pharmer
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
            className="w-full bg-[color:var(--bg-elev)] border border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm px-3 py-2 text-[12px] sm:text-xs uppercase tracking-[0.16em] text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors min-h-[40px]"
          />
        </form>

        <nav className="hidden md:flex gap-4 text-[color:var(--ink-mute)] shrink-0">
          <Link href="/method" className="hover:text-[color:var(--accent-deep)] transition-colors">
            Method
          </Link>
          <Link href="/about" className="hover:text-[color:var(--accent-deep)] transition-colors">
            About
          </Link>
          <Link href="/about#faqs" className="hover:text-[color:var(--accent-deep)] transition-colors">
            FAQs
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

      {/* Mobile-only nav strip — surfaces section links that are inaccessible from the header otherwise */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden border-t rule bg-[color:var(--bg-elev)]/40"
      >
        <ul className="max-w-[1280px] mx-auto px-4 flex items-stretch justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-[color:var(--ink-mute)]">
          <li className="flex-1">
            <Link
              href="/method"
              className="flex items-center justify-center min-h-[44px] hover:text-[color:var(--accent-deep)] transition-colors"
            >
              Method
            </Link>
          </li>
          <li className="flex-1">
            <Link
              href="/about"
              className="flex items-center justify-center min-h-[44px] hover:text-[color:var(--accent-deep)] transition-colors"
            >
              About
            </Link>
          </li>
          <li className="flex-1">
            <Link
              href="/about#faqs"
              className="flex items-center justify-center min-h-[44px] hover:text-[color:var(--accent-deep)] transition-colors"
            >
              FAQs
            </Link>
          </li>
          <li className="flex-1">
            <a
              href="https://instagram.com/foodpharmer"
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center min-h-[44px] hover:text-[color:var(--accent-deep)] transition-colors"
            >
              IG
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
