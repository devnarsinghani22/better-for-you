import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NotifyForm from "@/components/NotifyForm";
import NewRibbon from "@/components/NewRibbon";
import { getVisibleRestaurants } from "@/lib/restaurants/queries";
import { getVertical } from "@/lib/verticals";

export const revalidate = 3600;

export const metadata = {
  title: "Restaurants — Better for You by Food Pharmer",
  description:
    "Dishes worth ordering at restaurants across India — picked with the same label-first scrutiny we apply to packaged food.",
};

// Metros first, then anything else alphabetically.
const CITY_ORDER = ["Mumbai", "Delhi", "Bengaluru", "Kolkata", "Hyderabad"];

export default async function RestaurantsPage() {
  const restaurants = await getVisibleRestaurants();

  // No visible restaurants (e.g. prod before launch) → keep the coming-soon teaser.
  if (restaurants.length === 0) {
    const v = getVertical("restaurants");
    return (
      <div className="relative z-10 flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 sm:px-10 pt-10 sm:pt-16 pb-20 sm:pb-28">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 border-b rule pb-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[color:var(--ink-mute)]">
            <span className="whitespace-nowrap">Better for You · Restaurants</span>
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-[color:var(--ink)]">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--ink)] opacity-50 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--ink)]" />
              </span>
              In the works
            </span>
          </div>
          <div className="mt-12 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-x-14 gap-y-12">
            <div className="lg:col-span-7">
              <h1 className="font-display font-medium leading-[0.86] tracking-[-0.03em] text-[clamp(2.75rem,14vw,9rem)] lg:text-[8.5vw] text-[color:var(--ink)] break-words">
                Restaurants
              </h1>
            </div>
            <div className="lg:col-span-5 lg:pt-2 flex flex-col">
              <NotifyForm vertical={v?.slug ?? "restaurants"} />
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const byCity = new Map<string, typeof restaurants>();
  for (const r of restaurants) {
    if (!byCity.has(r.city)) byCity.set(r.city, []);
    byCity.get(r.city)!.push(r);
  }
  const cities = [...byCity.keys()].sort((a, b) => {
    const ia = CITY_ORDER.indexOf(a);
    const ib = CITY_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });

  return (
    <div className="relative z-10">
      <SiteHeader />
      <main className="w-full max-w-[1280px] mx-auto px-5 sm:px-10 pt-10 sm:pt-16 pb-20 sm:pb-28">
        <div className="flex items-end justify-between border-b rule pb-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[color:var(--ink-mute)]">
          <span>Better for You · Restaurants</span>
          <span>{restaurants.length} places</span>
        </div>

        <header className="mt-8 sm:mt-12">
          <h1 className="font-display font-medium leading-[0.9] tracking-[-0.025em] text-[12vw] sm:text-[8vw] lg:text-[5.6vw] text-[color:var(--ink)]">
            Restaurants
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-[color:var(--ink-soft)] leading-relaxed">
            Dishes worth ordering — the same label-first scrutiny we give
            packaged food, applied to menus across India.
          </p>
        </header>

        {cities.map((city) => {
          const list = byCity.get(city)!;
          return (
            <section key={city} className="mt-14 sm:mt-20">
              <div className="flex items-end justify-between mb-6 sm:mb-8 border-b rule pb-3">
                <h2 className="font-display text-3xl sm:text-5xl tracking-[-0.02em] leading-none">
                  {city}
                </h2>
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[color:var(--ink-mute)]">
                  {list.length} {list.length === 1 ? "place" : "places"}
                </span>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {list.map((r) => (
                  <li key={r.id} className="group">
                    <Link
                      href={`/r/${r.slug}`}
                      className="relative flex flex-col h-full bg-[color:var(--bg-elev)] border rule rounded-sm p-6 sm:p-7 transition-all duration-300 hover:border-[color:var(--accent-deep)] hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.28)]"
                    >
                      {r.is_new && <NewRibbon />}
                      {r.area && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                          {r.area}
                        </span>
                      )}
                      <h3 className="mt-2 font-display text-2xl sm:text-3xl tracking-[-0.02em] leading-[1.02] text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors">
                        {r.name}
                      </h3>
                      <div className="mt-auto pt-6 flex items-center justify-between">
                        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                          {r.approvedCount} {r.approvedCount === 1 ? "dish" : "dishes"}
                        </span>
                        <span
                          aria-hidden
                          className="font-mono text-[13px] text-[color:var(--ink-mute)] group-hover:text-[color:var(--accent-deep)] transition-colors"
                        >
                          View →
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
