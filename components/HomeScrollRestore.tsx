"use client";

import { useEffect } from "react";

/**
 * Precise scroll restoration for the homepage category index.
 *
 * Next's built-in back/forward restoration lands ~one card off here (entrance
 * animations + the dynamic re-render shift things during the restore window),
 * so a visitor who opens a category deep in the list and taps back gets bumped
 * up the page. We take manual control:
 *
 *  - Continuously remember the last scroll position (so it's never a transient
 *    value captured mid-tap).
 *  - When a category link is clicked, arm a one-shot restore.
 *  - On the next homepage mount (i.e. coming back), re-assert that position
 *    every frame for a short window — beating both layout settle and Next's
 *    own late, imprecise restore — and bail the instant the user scrolls.
 *
 * Arming only on category clicks means navigating home via the logo still
 * lands at the top.
 */
const POS_KEY = "home:scrollPos";
const ARM_KEY = "home:restoreArmed";

export default function HomeScrollRestore() {
  useEffect(() => {
    // 1) Continuously track scroll position (rAF-throttled).
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        try {
          sessionStorage.setItem(POS_KEY, String(window.scrollY));
        } catch {}
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // 2) Arm a restore when a category link is clicked.
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.('a[href^="/c/"]')) {
        try {
          sessionStorage.setItem(POS_KEY, String(window.scrollY));
          sessionStorage.setItem(ARM_KEY, "1");
        } catch {}
      }
    };
    document.addEventListener("click", onClick, true);

    // 3) On mount: if armed (came back from a category), force the position.
    const cancels: Array<() => void> = [];
    try {
      if (sessionStorage.getItem(ARM_KEY) === "1") {
        const target = parseInt(sessionStorage.getItem(POS_KEY) || "0", 10);
        sessionStorage.removeItem(ARM_KEY);

        if (target > 0) {
          let stop = false;
          const cancel = () => {
            stop = true;
          };
          // Only genuine scroll intent cancels — not a plain tap.
          for (const ev of ["wheel", "touchmove", "keydown"]) {
            window.addEventListener(ev, cancel, { once: true, passive: true });
            cancels.push(() => window.removeEventListener(ev, cancel));
          }

          const start = performance.now();
          const loop = () => {
            if (stop) return;
            window.scrollTo(0, target);
            if (performance.now() - start < 1500) requestAnimationFrame(loop);
          };
          requestAnimationFrame(loop);
        }
      }
    } catch {}

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
      cancels.forEach((c) => c());
    };
  }, []);

  return null;
}
