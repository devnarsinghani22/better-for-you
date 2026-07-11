import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NotifyForm from "@/components/NotifyForm";
import { getVertical, comingSoonVerticals } from "@/lib/verticals";

export const dynamic = "force-static";

export function generateStaticParams() {
  // "restaurants" has its own dedicated page at /v/restaurants, so it is
  // excluded here to avoid a duplicate-route conflict.
  return comingSoonVerticals
    .filter((v) => v.slug !== "restaurants")
    .map((v) => ({ vertical: v.slug }));
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
    title: `${v.label}: coming soon`,
    description: `Better for You ${v.label} by Food Pharmer. ${v.tagline ?? "Coming soon."}`,
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
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 sm:px-10 pt-10 sm:pt-16 pb-20 sm:pb-28">
        {/* Masthead meta row — reads like a magazine section marker.
            Stacks on mobile so neither line wraps awkwardly. */}
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 border-b rule pb-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[color:var(--ink-mute)]">
          <span className="whitespace-nowrap">Better for You · {v.label}</span>
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-[color:var(--ink)]">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--ink)] opacity-50 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--ink)]" />
            </span>
            In the works
          </span>
        </div>

        <div className="mt-12 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-x-14 gap-y-12">
          {/* Hero — the section name IS the headline */}
          <div className="lg:col-span-7">
            <h1 className="font-display font-medium leading-[0.86] tracking-[-0.03em] text-[clamp(2.75rem,14vw,9rem)] lg:text-[8.5vw] text-[color:var(--ink)] break-words">
              {v.label}
            </h1>
          </div>

          {/* Right rail — the invite card */}
          <div className="lg:col-span-5 lg:pt-2 flex flex-col">
            <NotifyForm vertical={v.slug} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
