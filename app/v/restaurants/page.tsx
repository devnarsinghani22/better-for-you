import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NotifyForm from "@/components/NotifyForm";
import RestaurantsExplorer from "@/components/RestaurantsExplorer";
import { getVisibleRestaurants } from "@/lib/restaurants/queries";
import { getVertical } from "@/lib/verticals";

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
        </header>

        <div className="mt-8 max-w-2xl">
          <p className="font-mono text-[12px] sm:text-[13px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]">
            Restaurants and Dish recommendations that are Better For You
          </p>
        </div>

        <RestaurantsExplorer restaurants={restaurants} />
      </main>
      <SiteFooter />
    </div>
  );
}
