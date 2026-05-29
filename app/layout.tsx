import { ViewTransition } from "react";
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Newsreader, JetBrains_Mono, Caveat } from "next/font/google";
import Script from "next/script";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PushRegistration from "@/components/PushRegistration";
import BackButton from "@/components/BackButton";
import NativeAppShell from "@/components/NativeAppShell";
import "./globals.css";

const CLARITY_PROJECT_ID = "wv3da4qpra";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// Handwriting face — used only for personal notes from Revant.
const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://foodpharmer.health"),
  title: {
    default: "Better for You by Food Pharmer",
    template: "%s | Better for You by Food Pharmer",
  },
  description:
    "We analyse ingredient lists and nutrition labels to shortlist products that are better for you. Not sponsored.",
  openGraph: {
    title: "Better for You by Food Pharmer",
    description:
      "We analyse ingredient lists and nutrition labels to shortlist products that are better for you. Not sponsored.",
    type: "website",
    locale: "en_IN",
    url: "https://foodpharmer.health",
    siteName: "Better for You by Food Pharmer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Better for You by Food Pharmer",
    description:
      "We analyse ingredient lists and nutrition labels to shortlist products that are better for you. Not sponsored.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Better for You",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  // Let the WebView extend under the notch/status bar so we can pad with
  // env(safe-area-inset-*) — without this the insets read as 0 in the app.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${newsreader.variable} ${mono.variable} ${caveat.variable}`}
    >
      <head>
        {/* Preconnect to third-party origins we actually hit at the start of
            every visit. Clarity loads the analytics tag synchronously after
            interactive, so warming the TLS handshake at HTML parse saves
            ~150-250ms on Indian mobile. */}
        <link rel="preconnect" href="https://www.clarity.ms" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Skip-to-content for screen-reader + keyboard users. Visible only
            on focus, so it doesn't affect the visual design. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-[color:var(--ink)] focus:text-[color:var(--bg)] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.22em]"
        >
          Skip to content
        </a>
        <ViewTransition>{children}</ViewTransition>
        <ServiceWorkerRegister />
        <PushRegistration />
        <BackButton />
        <NativeAppShell />
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
        </Script>
      </body>
    </html>
  );
}
