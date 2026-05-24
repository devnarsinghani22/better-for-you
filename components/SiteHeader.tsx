import SearchBox from "@/components/SearchBox";
import { VerticalNavDesktop, VerticalNavMobile } from "@/components/VerticalNav";

export default function SiteHeader() {
  return (
    <header className="border-b rule sticky top-0 z-30 bg-[color:var(--bg)]/90 backdrop-blur-md">
      <div className="bg-[color:var(--ink)] text-[color:var(--bg)] py-1.5 text-center font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em]">
        Not sponsored · Not paid · Not affiliated
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-5 text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em]">
        <SearchBox />

        <VerticalNavDesktop />

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
        className="md:hidden border-t rule bg-[color:var(--bg-elev)]"
      >
        <ul className="max-w-[1280px] mx-auto px-2 flex items-stretch justify-between text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[color:var(--ink)] divide-x divide-[color:var(--ink-mute)]/30">
          <VerticalNavMobile />
          <li className="flex-1">
            <a
              href="https://instagram.com/foodpharmer"
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-1 min-h-[48px] px-2 active:bg-[color:var(--accent)]/30 hover:text-[color:var(--accent-deep)] transition-colors"
            >
              IG <span aria-hidden>→</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
