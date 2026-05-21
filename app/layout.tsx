import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
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
      className={`${hanken.variable} ${mono.variable}`}
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
