import type { Metadata } from "next";
import { Fraunces, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
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

export const metadata: Metadata = {
  metadataBase: new URL("https://foodpharmer-approved.vercel.app"),
  title: {
    default: "Food Pharmer Approved",
    template: "%s | Food Pharmer Approved",
  },
  description:
    "A small list of packaged foods that meet Food Pharmer's criteria. We read the ingredients so you don't have to.",
  openGraph: {
    title: "Food Pharmer Approved",
    description:
      "A small list of packaged foods that meet Food Pharmer's criteria. We read the ingredients so you don't have to.",
    type: "website",
    locale: "en_IN",
    url: "https://foodpharmer-approved.vercel.app",
    siteName: "Food Pharmer Approved",
  },
  twitter: {
    card: "summary_large_image",
    title: "Food Pharmer Approved",
    description:
      "Packaged foods we'd actually buy. We read the ingredients so you don't have to.",
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
      className={`${fraunces.variable} ${newsreader.variable} ${mono.variable}`}
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
