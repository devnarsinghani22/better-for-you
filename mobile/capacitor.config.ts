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
};

export default config;
