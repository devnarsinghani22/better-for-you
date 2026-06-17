import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NotifyForm from "@/components/NotifyForm";
import { getVisibleRestaurants } from "@/lib/restaurants/queries";
import { getVertical } from "@/lib/verticals";
import RestaurantCriteria from "@/components/RestaurantCriteria";
import { citySlug, cityMetaByName, cityRank } from "@/lib/restaurants/cities";

export const revalidate = 3600;

export const metadata = {
  title: "Restaurants — Better for You by Food Pharmer",
  description:
    "Dishes worth ordering at restaurants across India — picked with the same label-first scrutiny we apply to packaged food.",
};

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

  // Group restaurants into cities, metros first (cityRank), extras alphabetical.
  const counts = new Map<string, number>();
  for (const r of restaurants) counts.set(r.city, (counts.get(r.city) ?? 0) + 1);
  const cities = [...counts.keys()]
    .map((name) => ({
      name,
      slug: citySlug(name),
      count: counts.get(name)!,
      meta: cityMetaByName(name),
    }))
    .sort(
      (a, b) => cityRank(a.name) - cityRank(b.name) || a.name.localeCompare(b.name)
    );

  return (
    <div className="relative z-10">
      <SiteHeader />
      <main className="w-full max-w-[1280px] mx-auto px-5 sm:px-10 pt-10 sm:pt-16 pb-20 sm:pb-28">
        <header>
          <h1 className="font-display font-medium leading-[0.9] tracking-[-0.025em] text-[12vw] sm:text-[8vw] lg:text-[5.6vw] text-[color:var(--ink)]">
            Restaurants
          </h1>
          <div className="mt-5 sm:mt-6 max-w-xl border rule rounded-sm bg-[color:var(--bg-elev)] p-5 sm:p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.3)]">
            <p className="font-medium leading-[1.2] tracking-[-0.01em] text-lg sm:text-xl text-[color:var(--ink-soft)]">
              Restaurants that are Better for You.
            </p>
            <p className="mt-1.5 leading-[1.5] text-sm sm:text-base text-[color:var(--ink-mute)]">
              We have also shortlisted Better for You dishes for each restaurant.
            </p>
          </div>
        </header>

        <RestaurantCriteria className="mt-10 sm:mt-12" />

        {/* CITIES — scenic index, mirrors the packaged-food Categories grid */}
        <section className="mt-14 sm:mt-20 border-t rule pt-8 sm:pt-10">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <h2 className="font-display text-3xl sm:text-5xl tracking-[-0.02em] leading-none">
              Cities
            </h2>
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)]">
              {cities.length} {cities.length === 1 ? "city" : "cities"}
            </span>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {cities.map((city, i) => (
              <li
                key={city.slug}
                className="group transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:hover:scale-[1.03] sm:hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.28)]"
              >
                <Link
                  href={`/v/restaurants/${city.slug}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--ink)]"
                >
                  <article className="bg-[color:var(--bg-elev)] overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-[16/10] sm:aspect-[16/11] bg-[color:var(--photo-bg)] overflow-hidden">
                      {city.meta?.image && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={city.meta.image}
                          alt={`${city.name} — ${city.meta.landmark}`}
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:group-hover:scale-[1.08]"
                        />
                      )}
                    </div>
                    <div className="p-5 sm:p-7 pb-0 sm:pb-0">
                      <h3 className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-[0.95] text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors">
                        {city.name}
                      </h3>
                    </div>
                    <div className="px-5 sm:px-7 pb-5 sm:pb-7 flex-1 flex flex-col">
                      <div className="mt-6 pt-5 border-t rule flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)] sm:order-first text-center sm:text-left">
                          {city.count} {city.count === 1 ? "place" : "places"}
                        </span>
                        <span className="inline-flex items-center justify-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] font-mono text-[13px] uppercase tracking-[0.22em] px-4 py-2.5 sm:py-2 w-full sm:w-auto group-hover:bg-[color:var(--accent-deep)] transition-colors">
                          View section <span aria-hidden>→</span>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
