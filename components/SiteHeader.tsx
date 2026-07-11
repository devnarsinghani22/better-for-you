import SearchBox from "@/components/SearchBox";
import { VerticalNavDesktop, VerticalNavMobile } from "@/components/VerticalNav";

export default function SiteHeader() {
  return (
    <header className="border-b rule sticky top-0 z-30 bg-[color:var(--bg)]/90 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em]">
        <VerticalNavDesktop />

        {/* Wider on desktop so the search affordance reads as primary, not
            a decoration. Clarity flagged 4.8% search usage on a 200+ SKU
            catalogue — promoting the input. */}
        <div className="w-full sm:w-auto sm:ml-auto sm:max-w-[26rem] sm:flex-1 sm:flex-none">
          <SearchBox />
        </div>
      </div>

      {/* Mobile-only nav strip — surfaces section links that are inaccessible from the header otherwise */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden border-t rule bg-[color:var(--bg-elev)]"
      >
        {/* tracking tightened 0.2em -> 0.12em when the strip went from 2 to 3
            cells so "Packaged Food" still fits one line on ~360px phones. */}
        <ul className="max-w-[1280px] mx-auto px-2 flex items-stretch justify-between text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-[color:var(--ink)] divide-x divide-[color:var(--ink-mute)]/30">
          <VerticalNavMobile />
        </ul>
      </nav>
    </header>
  );
}
