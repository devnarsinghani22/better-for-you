"use client";

import { useEffect } from "react";

// iOS-style edge-swipe-back: a one-finger gesture starting at the left screen
// edge and moving right past a threshold navigates back in history. iOS only —
// Android has its own system back gesture (handled by BackButton). Native app
// only; a normal browser never loads this.
export default function SwipeBack() {
  useEffect(() => {
    let cancelled = false;
    let active = false;
    let startX = 0;
    let startY = 0;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        active = false;
        return;
      }
      const t = e.touches[0];
      active = t.clientX <= 24; // began within the left edge
      startX = t.clientX;
      startY = t.clientY;
    };
    const onEnd = (e: TouchEvent) => {
      if (!active) return;
      active = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      // mostly-horizontal rightward swipe, and not already at the home page
      if (dx > 70 && dy < 50 && window.location.pathname !== "/") {
        window.history.back();
      }
    };

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (cancelled || !Capacitor.isNativePlatform()) return;
        if (Capacitor.getPlatform() !== "ios") return;
        document.addEventListener("touchstart", onStart, { passive: true });
        document.addEventListener("touchend", onEnd, { passive: true });
      } catch {
        // ignore — never break the app shell
      }
    })();

    return () => {
      cancelled = true;
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, []);

  return null;
}
