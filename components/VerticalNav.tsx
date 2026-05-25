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
              className={`flex flex-col items-center justify-center gap-1 min-h-[48px] px-2 active:bg-[color:var(--accent)]/30 transition-colors ${
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
    </>
  );
}
