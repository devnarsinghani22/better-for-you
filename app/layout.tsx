import type { Metadata, Viewport } from "next";
import { Playfair_Display, Newsreader, JetBrains_Mono, Caveat } from "next/font/google";
import Script from "next/script";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
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
      <body className="min-h-screen flex flex-col">
        {children}
        <ServiceWorkerRegister />
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
