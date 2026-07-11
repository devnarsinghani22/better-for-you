"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VERTICALS, type Vertical } from "@/lib/verticals";

// "Foods" (the live catalog) is active for any non-vertical route; a "soon"
// vertical is active only on its own /v/<slug> page.
function isActive(pathname: string, v: Vertical): boolean {
  return v.status === "live" ? !pathname.startsWith("/v/") : pathname === v.href;
}

function SoonTag() {
  return (
    <span className="mt-1 text-[8px] leading-none tracking-[0.16em] text-[color:var(--ink-mute)] uppercase">
      coming soon
    </span>
  );
}

export function VerticalNavDesktop() {
  const pathname = usePathname() || "/";
  const oilActive = pathname.startsWith("/oil-board");
  return (
    <nav
      aria-label="Sections"
      className="hidden md:flex gap-5 items-start text-[color:var(--ink-mute)] shrink-0"
    >
      {VERTICALS.map((v) => {
        const active = isActive(pathname, v);
        return (
          <Link
            key={v.slug}
            href={v.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex flex-col items-start leading-none transition-colors ${
              active
                ? "text-[color:var(--ink)]"
                : "hover:text-[color:var(--accent-deep)]"
            }`}
          >
            <span>{v.label}</span>
            {v.status === "soon" && <SoonTag />}
          </Link>
        );
      })}
      {/* Oil Board is a free resource, not a product vertical — kept out of
          VERTICALS (which drives /v/[vertical] routing) but shown as a peer
          nav link. */}
      <Link
        href="/oil-board"
        aria-current={oilActive ? "page" : undefined}
        className={`inline-flex flex-col items-start leading-none transition-colors ${
          oilActive
            ? "text-[color:var(--ink)]"
            : "hover:text-[color:var(--accent-deep)]"
        }`}
      >
        <span>Oil Board</span>
      </Link>
    </nav>
  );
}

export function VerticalNavMobile() {
  const pathname = usePathname() || "/";
  const oilActive = pathname.startsWith("/oil-board");
  return (
    <>
      {VERTICALS.map((v) => {
        const active = isActive(pathname, v);
        return (
          <li key={v.slug} className="flex-1">
            <Link
              href={v.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-h-[48px] px-1.5 text-center active:bg-[color:var(--accent)]/30 transition-colors ${
                active
                  ? "text-[color:var(--accent-deep)]"
                  : "hover:text-[color:var(--accent-deep)]"
              }`}
            >
              <span>{v.label}</span>
              {v.status === "soon" && <SoonTag />}
            </Link>
          </li>
        );
      })}
      {/* Oil Board resource link — peer of the vertical cells. */}
      <li className="flex-1">
        <Link
          href="/oil-board"
          aria-current={oilActive ? "page" : undefined}
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] px-1.5 text-center active:bg-[color:var(--accent)]/30 transition-colors ${
            oilActive
              ? "text-[color:var(--accent-deep)]"
              : "hover:text-[color:var(--accent-deep)]"
          }`}
        >
          <span>Oil Board</span>
        </Link>
      </li>
    </>
  );
}
