"use client";

import { useCallback, type ReactNode } from "react";

// Fires a tiny beacon to /api/track *before* navigating to an outbound
// store URL. Uses navigator.sendBeacon so it survives the page unload
// — no race, no "click the page is leaving" stalls.
export default function BuyLink({
  slug,
  href,
  className,
  children,
}: {
  slug: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const onClick = useCallback(() => {
    try {
      const payload = JSON.stringify({
        type: "outbound",
        slug,
        target: href,
      });
      const ok =
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function" &&
        navigator.sendBeacon(
          "/api/track",
          new Blob([payload], { type: "application/json" }),
        );
      if (!ok) {
        // Fallback for old browsers / disabled beacons. Keepalive so the
        // request survives the navigation.
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* never block navigation on tracking */
    }
  }, [slug, href]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={className}
    >
      {children}
    </a>
  );
}
