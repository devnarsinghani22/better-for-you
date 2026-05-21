import type { Metadata } from "next";
import { Fraunces, EB_Garamond, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const garamond = EB_Garamond({
  variable: "--font-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${garamond.variable} ${mono.variable}`}
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
