import type { CapacitorConfig } from "@capacitor/cli";

// The Next.js site is server-rendered, so the app runs as a fullscreen native
// WebView that loads the live site rather than bundling pages. Points at PROD
// (the public catalog) — this is the target for both internal testing and the
// store release. Swap to https://stg.foodpharmer.health to test draft content.
const config: CapacitorConfig = {
  appId: "health.foodpharmer.app",
  appName: "Better for You",
  webDir: "www",
  server: {
    url: "https://foodpharmer.health",
    cleartext: false,
  },
  android: {
    backgroundColor: "#ffffff",
  },
  ios: {
    backgroundColor: "#ffffff",
  },
  plugins: {
    // Hold the brand splash for a beat so users see the logo, not a blank
    // WebView, while the live site loads over the network. Auto-hides after
    // the window below (a safety cap that also covers a slow/failed load).
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
  },
};

export default config;
