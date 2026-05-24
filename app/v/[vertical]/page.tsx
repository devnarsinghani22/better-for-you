import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NotifyForm from "@/components/NotifyForm";
import { getVertical, comingSoonVerticals } from "@/lib/verticals";

export const dynamic = "force-static";

export function generateStaticParams() {
  return comingSoonVerticals.map((v) => ({ vertical: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  const v = getVertical(vertical);
  if (!v) return {};
  return {
    title: `${v.label} — coming soon`,
    description: `Better for You ${v.label} by Food Pharmer — ${v.tagline ?? "coming soon."}`,
  };
}

export default async function VerticalComingSoon({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  const v = getVertical(vertical);
  // Only "soon" verticals have a teaser page; "foods" lives at "/".
  if (!v || v.status !== "soon") notFound();

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 sm:px-10 pt-16 sm:pt-24 pb-20 sm:pb-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)]">
          Better for You · {v.label}
        </p>

        <h1 className="font-display font-medium leading-[0.9] tracking-[-0.025em] text-[14vw] sm:text-[9vw] lg:text-[6.5vw] mt-4 text-[color:var(--ink)]">
          Coming soon.
        </h1>

        {v.tagline && (
          <p className="mt-6 font-display italic text-2xl sm:text-3xl text-[color:var(--accent-deep)] leading-tight max-w-2xl">
            {v.tagline}
          </p>
        )}

        {v.blurb && (
          <p className="mt-6 text-base sm:text-lg text-[color:var(--ink-soft)] leading-relaxed max-w-2xl">
            {v.blurb}
          </p>
        )}

        <NotifyForm vertical={v.slug} label={v.label} />

        <div className="mt-14 pt-8 border-t rule">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)] hover:text-[color:var(--accent-deep)] transition-colors"
          >
            ← Browse Better for You Foods
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
