"use client";

import { useEffect } from "react";

// Theme the native status bar to match the white editorial design: dark
// text/icons on white. Native app only; backward-safe if the plugin isn't in
// the installed build yet.
export default function StatusBarTheme() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (cancelled || !Capacitor.isNativePlatform()) return;
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        // Style.Light = dark content (text/icons), for our light background.
        StatusBar.setStyle({ style: Style.Light }).catch(() => {});
        if (Capacitor.getPlatform() === "android") {
          StatusBar.setBackgroundColor({ color: "#ffffff" }).catch(() => {});
        }
      } catch {
        // ignore — never break the app shell
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
