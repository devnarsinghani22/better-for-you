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
    <span className="text-[8px] leading-none tracking-[0.18em] text-[color:var(--ink-mute)]/70 lowercase">
      soon
    </span>
  );
}

export function VerticalNavDesktop() {
  const pathname = usePathname() || "/";
  return (
    <nav
      aria-label="Sections"
      className="hidden md:flex gap-4 items-center text-[color:var(--ink-mute)] shrink-0"
    >
      {VERTICALS.map((v) => {
        const active = isActive(pathname, v);
        return (
          <Link
            key={v.slug}
            href={v.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-baseline gap-1 transition-colors ${
              active
                ? "text-[color:var(--ink)]"
                : "hover:text-[color:var(--accent-deep)]"
            }`}
          >
            {v.label}
            {v.status === "soon" && <SoonTag />}
          </Link>
        );
      })}
    </nav>
  );
}

export function VerticalNavMobile() {
  const pathname = usePathname() || "/";
  return (
    <>
      {VERTICALS.map((v) => {
        const active = isActive(pathname, v);
        return (
          <li key={v.slug} className="flex-1">
            <Link
              href={v.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center justify-center gap-1 min-h-[48px] px-2 active:bg-[color:var(--accent)]/30 transition-colors ${
                active
                  ? "text-[color:var(--accent-deep)]"
                  : "hover:text-[color:var(--accent-deep)]"
              }`}
            >
              {v.label}
              {v.status === "soon" && <SoonTag />}
            </Link>
          </li>
        );
      })}
    </>
  );
}
