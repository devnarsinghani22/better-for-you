"use client";

import { useEffect } from "react";

// Make the Android hardware back button navigate the site's history instead of
// instantly exiting the app (Capacitor's default for a remote-WebView app is to
// finish the activity, which feels like the app quitting on every back press).
//
// Native-only: every Capacitor import is behind isNativePlatform(), so web
// visitors download and run none of it. At the home page we let back exit the
// app; anywhere else it goes back one step in history (Next.js router-aware).
export default function BackButton() {
  useEffect(() => {
    let remove: (() => void) | null = null;

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { App } = await import("@capacitor/app");
        const handle = await App.addListener("backButton", () => {
          if (window.location.pathname === "/") {
            App.exitApp();
          } else {
            window.history.back();
          }
        });
        remove = () => handle.remove();
      } catch {
        // Never let back-button wiring break the app shell.
      }
    })();

    return () => {
      if (remove) remove();
    };
  }, []);

  return null;
}
