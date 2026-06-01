"use client";

import { useEffect } from "react";

// A light haptic tap on every interactive press inside the native app. Fires on
// 'click' (capture phase) so it never triggers while scrolling. Native app only;
// backward-safe — if the haptics plugin isn't in the installed build yet, the
// call is ignored (so it can ship to web before the app rebuild lands).
export default function HapticTaps() {
  useEffect(() => {
    let cancelled = false;
    let onClick: ((e: MouseEvent) => void) | null = null;

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (cancelled || !Capacitor.isNativePlatform()) return;
        const { Haptics, ImpactStyle } = await import("@capacitor/haptics");

        onClick = (e) => {
          const el = e.target as Element | null;
          if (el && el.closest("a, button, [role='button'], [role='option']")) {
            try {
              Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
            } catch {
              // plugin not present in this build — ignore
            }
          }
        };
        document.addEventListener("click", onClick, { capture: true });
      } catch {
        // ignore — never break the app shell
      }
    })();

    return () => {
      cancelled = true;
      if (onClick) {
        document.removeEventListener("click", onClick, { capture: true });
      }
    };
  }, []);

  return null;
}
