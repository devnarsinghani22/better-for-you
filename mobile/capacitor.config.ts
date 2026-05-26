import type { CapacitorConfig } from "@capacitor/cli";

// Internal build. The Next.js site is server-rendered, so the app runs as a
// fullscreen native WebView that loads the live site rather than bundling pages.
// Points at STAGING so internal testers see the in-progress catalog. Switch
// `server.url` to https://foodpharmer.health for a public/production build.
const config: CapacitorConfig = {
  appId: "health.foodpharmer.app",
  appName: "Better for You",
  webDir: "www",
  server: {
    url: "https://stg.foodpharmer.health",
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
