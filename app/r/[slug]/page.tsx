import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewRibbon from "@/components/NewRibbon";
import { getRestaurantBySlug } from "@/lib/restaurants/queries";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  if (!r) return {};
  return {
    title: `${r.name} — Better for You by Food Pharmer`,
    description: `Dishes worth ordering at ${r.name}${r.city ? `, ${r.city}` : ""}.`,
  };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  if (!r) notFound();

  return (
    <>
      <SiteHeader />
      <main className="w-full max-w-[1100px] mx-auto px-5 sm:px-10 py-10 sm:py-16 relative z-10">
        <nav className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
          <Link
            href="/v/restaurants"
            className="hover:text-[color:var(--accent-deep)] transition-colors"
          >
            ← Restaurants
          </Link>
        </nav>

        <header className="mt-8 relative">
          {r.is_new && <NewRibbon />}
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            {[r.city, r.area].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-2 font-display text-5xl sm:text-6xl lg:text-7xl tracking-[-0.02em] leading-[0.95] text-[color:var(--ink)]">
            {r.name}
          </h1>
          <div className="mt-6 inline-flex items-center gap-3">
            <span className="bg-[color:var(--ink)] text-[color:var(--bg)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em]">
              Better for You
            </span>
          </div>
          {r.menu_url && (
            <a
              href={r.menu_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 ml-0 sm:ml-3 inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-6 py-4 sm:py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors"
            >
              See the menu →
            </a>
          )}
        </header>

        <section className="mt-12 border-t rule pt-10">
          <h2 className="font-display text-3xl tracking-tight">
            Dishes worth ordering
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mt-1">
            {r.dishes.length} {r.dishes.length === 1 ? "pick" : "picks"} · our team would order these
          </p>

          {r.dishes.length > 0 ? (
            <ul className="mt-6 border-t rule">
              {r.dishes.map((d) => (
                <li key={d.id} className="border-b rule py-5 flex items-start gap-4">
                  <span
                    aria-hidden
                    className="mt-1 font-mono text-sm text-[color:var(--accent-deep)]"
                  >
                    ✓
                  </span>
                  <div>
                    <div className="font-display text-xl sm:text-2xl tracking-tight text-[color:var(--ink)]">
                      {d.name}
                    </div>
                    {d.blurb && (
                      <p className="mt-1 text-[color:var(--ink-soft)] leading-relaxed">
                        {d.blurb}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-[color:var(--ink-soft)]">
              We are still curating the picks for this place.
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
