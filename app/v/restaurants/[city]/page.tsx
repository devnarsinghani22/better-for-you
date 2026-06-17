import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RestaurantCard from "@/components/RestaurantCard";
import { getVisibleRestaurants } from "@/lib/restaurants/queries";
import { cityMetaBySlug, citySlug } from "@/lib/restaurants/cities";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const meta = cityMetaBySlug(city);
  const name = meta?.name ?? city;
  return {
    title: `${name} — Better for You Restaurants by Food Pharmer`,
    description: `Restaurants in ${name} worth ordering from — picked with the same label-first scrutiny we apply to packaged food.`,
  };
}

export default async function CityRestaurantsPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const all = await getVisibleRestaurants();
  const list = all.filter((r) => citySlug(r.city) === city);
  if (list.length === 0) notFound();

  const meta = cityMetaBySlug(city);
  const name = meta?.name ?? list[0].city;

  return (
    <div className="relative z-10">
      <SiteHeader />
      <main className="w-full max-w-[1280px] mx-auto px-5 sm:px-10 py-10 sm:py-16">
        <Link
          href="/v/restaurants"
          className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)] hover:text-[color:var(--accent-deep)] transition-colors"
        >
          ← Cities
        </Link>

        {meta?.image && (
          <div className="mt-6 relative w-full aspect-[16/7] sm:aspect-[16/5] overflow-hidden border rule rounded-sm bg-[color:var(--photo-bg)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meta.image}
              alt={`${name} — ${meta.landmark}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        <header className="mt-6 sm:mt-8 pb-8 sm:pb-10 border-b rule">
          <h1 className="font-display text-5xl sm:text-7xl tracking-[-0.02em] leading-[0.95]">
            {name}
          </h1>
          <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            {list.length} {list.length === 1 ? "place" : "places"}
          </div>
        </header>

        <ul className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {list.map((r) => (
            <li key={r.id}>
              <RestaurantCard r={r} />
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
