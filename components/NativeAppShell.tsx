"use client";

import { useEffect } from "react";

// Adds the `capacitor-native` class to <html> when running inside the app, so
// the native-only polish in globals.css applies. No-op (and zero Capacitor
// download) in a normal browser, so the public website is untouched.
export default function NativeAppShell() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!cancelled && Capacitor.isNativePlatform()) {
          document.documentElement.classList.add("capacitor-native");
        }
      } catch {
        // ignore — never block the app shell
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
