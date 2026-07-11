import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OilBoardsForm from "./OilBoardsForm";

export const revalidate = 3600;

const SITE_URL = "https://foodpharmer.health";

export const metadata = {
  // Bare page name only — the layout template appends
  // "| Better for You by Food Pharmer" (don't repeat it here).
  title: "Oil Boards: Free PDF",
  description:
    "See how much oil is really in everyday foods like samosa and biscuits. A free PDF from Food Pharmer, emailed to your inbox.",
  alternates: { canonical: `${SITE_URL}/oil-boards` },
};

export default function OilBoardsPage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        tabIndex={-1}
        className="outline-none max-w-[1000px] mx-auto px-6 sm:px-10 py-16 relative z-10"
      >
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)] hover:text-[color:var(--accent-deep)]"
        >
          ← Home
        </Link>

        <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-16 md:items-start">
          <section>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.05]">
              The Oil Boards
            </h1>
            <p className="mt-5 text-lg text-[color:var(--ink-soft)] leading-relaxed max-w-md">
              How much oil is really in a samosa, a packet of biscuits, your
              everyday snacks? The Oil Boards show you, at a glance.
            </p>
            <p className="mt-4 text-[color:var(--ink-soft)] leading-relaxed max-w-md">
              Drop your email and we&rsquo;ll send you the PDF. No download
              link, no fuss. It lands straight in your inbox.
            </p>
          </section>

          <section className="md:pt-2">
            <OilBoardsForm />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
