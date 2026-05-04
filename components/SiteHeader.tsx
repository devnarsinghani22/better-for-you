import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b rule sticky top-0 z-30 bg-[color:var(--bg)]/90 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-3 flex items-center gap-3 sm:gap-5 text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em]">
        <Link
          href="/"
          aria-label="Food Pharmer Approved — home"
          className="text-[color:var(--accent-deep)] hover:text-[color:var(--ink)] transition-all shrink-0 -rotate-3 hover:rotate-2"
        >
          <svg
            viewBox="0 0 100 100"
            className="size-24 sm:size-32"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <path
                id="stamp-arc"
                d="M 50,50 m 0,-38 a 38,38 0 1,1 -0.01,0"
              />
            </defs>
            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.6" />
            <text
              fontSize="10"
              letterSpacing="1.8"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontWeight={700}
              fill="currentColor"
            >
              <textPath href="#stamp-arc" startOffset="0">
                APPROVED · APPROVED · APPROVED
              </textPath>
            </text>
            <text
              x="50"
              y="47"
              textAnchor="middle"
              fontSize="9.5"
              letterSpacing="0.5"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontWeight={700}
              fill="currentColor"
            >
              FOOD
            </text>
            <text
              x="50"
              y="59"
              textAnchor="middle"
              fontSize="9.5"
              letterSpacing="0.5"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontWeight={700}
              fill="currentColor"
            >
              PHARMER
            </text>
          </svg>
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
