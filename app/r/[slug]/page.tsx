import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DishCard from "@/components/DishCard";
import { getRestaurantBySlug } from "@/lib/restaurants/queries";

const SITE_ORIGIN =
  process.env.VERCEL_ENV === "production"
    ? "https://foodpharmer.health"
    : "https://stg.foodpharmer.health";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  if (!r) return {};
  const ogImage = r.hero_image_url ?? r.card_image_url;
  return {
    title: `${r.name} — Better for You by Food Pharmer`,
    description:
      r.tagline ??
      `Better for You dishes at ${r.name}${r.city ? `, ${r.city}` : ""}.`,
    // WhatsApp/OG preview card — the share CTA is the main distribution path.
    ...(ogImage ? { openGraph: { images: [ogImage] } } : {}),
  };
}

// Small CTA button used for delivery / map / menu links.
function CTA({
  href,
  label,
  variant = "outline",
}: {
  href: string;
  label: string;
  variant?: "solid" | "outline";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors whitespace-nowrap";
  const styles =
    variant === "solid"
      ? "bg-[color:var(--ink)] text-[color:var(--bg)] hover:bg-[color:var(--accent-deep)]"
      : "border rule text-[color:var(--ink)] hover:border-[color:var(--accent-deep)] hover:text-[color:var(--accent-deep)]";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles}`}
    >
      {label}
      <span aria-hidden>→</span>
    </a>
  );
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  if (!r) notFound();

  const hasHero = !!r.hero_image_url;

  // schema.org/Restaurant JSON-LD for SEO. Only fields we have populated;
  // address falls back to city when no street address.
  const ld = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    url: `${SITE_ORIGIN}/r/${r.slug}`,
    ...(r.hero_image_url ? { image: r.hero_image_url } : {}),
    ...(r.cuisine ? { servesCuisine: r.cuisine } : {}),
    ...(r.price_band ? { priceRange: r.price_band } : {}),
    ...(r.menu_url ? { menu: r.menu_url } : {}),
    ...(r.phone ? { telephone: r.phone } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: r.city,
      ...(r.address ? { streetAddress: r.address } : {}),
      ...(r.area ? { addressRegion: r.area } : {}),
      addressCountry: "IN",
    },
    ...(r.dishes.length > 0
      ? {
          hasMenu: {
            "@type": "Menu",
            name: "Better-for-you picks",
            hasMenuSection: {
              "@type": "MenuSection",
              name: "Better for You Dishes",
              hasMenuItem: r.dishes.map((d) => ({
                "@type": "MenuItem",
                name: d.name,
                ...(d.blurb ? { description: d.blurb } : {}),
                ...(d.image_url ? { image: d.image_url } : {}),
                ...(d.price != null
                  ? {
                      offers: {
                        "@type": "Offer",
                        price: Number(d.price),
                        priceCurrency: "INR",
                      },
                    }
                  : {}),
              })),
            },
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <SiteHeader />
      <main className="relative z-10 w-full">
        {/* Hero band — image-backed if available, else editorial typography. */}
        <section className="relative w-full">
          {hasHero ? (
            <div className="relative h-[42vh] sm:h-[58vh] min-h-[300px] sm:min-h-[420px] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.hero_image_url!}
                alt={r.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70" />
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="w-full max-w-[1100px] mx-auto px-5 sm:px-10 pb-8 sm:pb-12 text-white">
                  <Link
                    href="/v/restaurants"
                    className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/70 hover:text-white transition-colors"
                  >
                    ← Restaurants
                  </Link>
                  <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-white/80">
                    {[r.city, r.area].filter(Boolean).join(" · ")}
                  </p>
                  <h1 className="mt-2 font-display text-5xl sm:text-7xl lg:text-8xl tracking-[-0.025em] leading-[0.95]">
                    {r.name}
                  </h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[1100px] mx-auto px-5 sm:px-10 pt-10 sm:pt-14">
              <nav className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                <Link
                  href="/v/restaurants"
                  className="hover:text-[color:var(--accent-deep)] transition-colors"
                >
                  ← Restaurants
                </Link>
              </nav>
              <header className="mt-8 relative">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                  {[r.city, r.area].filter(Boolean).join(" · ")}
                </p>
                <h1 className="mt-2 font-display text-5xl sm:text-7xl lg:text-8xl tracking-[-0.025em] leading-[0.95] text-[color:var(--ink)]">
                  {r.name}
                </h1>
              </header>
            </div>
          )}
        </section>

        <div className="w-full max-w-[1100px] mx-auto px-5 sm:px-10 py-10 sm:py-14">
          {/* Meta strip — cuisine · price · approved seal */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b rule pb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            <span className="bg-[color:var(--ink)] text-[color:var(--bg)] px-3 py-1.5">
              ✓ Better for You
            </span>
            {r.price_band && <span>{r.price_band}</span>}
          </div>

          {/* CTA cluster */}
          <div className="mt-6 flex flex-wrap gap-3">
            {r.menu_url && (
              <CTA href={r.menu_url} label="See the menu" variant="solid" />
            )}
            {(r.zomato_url || r.swiggy_url) && (
              <div className="flex gap-3">
                {r.zomato_url && (
                  <CTA href={r.zomato_url} label="Order · Zomato" />
                )}
                {r.swiggy_url && (
                  <CTA href={r.swiggy_url} label="Order · Swiggy" />
                )}
              </div>
            )}
            {r.phone && <CTA href={`tel:${r.phone}`} label="Call" />}
          </div>

          {/* Dishes */}
          <section className="mt-14 sm:mt-20">
            <div className="flex items-end justify-between border-b rule pb-4">
              <h2 className="font-display text-3xl sm:text-5xl tracking-[-0.02em] leading-none">
                Better for You Dishes
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                {r.dishes.length} {r.dishes.length === 1 ? "pick" : "picks"}
              </span>
            </div>

            {r.dishes.length > 0 ? (
              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {r.dishes.map((d) => (
                  <li key={d.id}>
                    <DishCard dish={d} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-[color:var(--ink-soft)]">
                We are still curating the picks for this place.
              </p>
            )}
          </section>

          {/* Where — outlets list (or single address) after the dishes. */}
          {(r.outlets.length > 0 || r.address) && (
            <section className="mt-14 sm:mt-20 border-t rule pt-6">
              <div className="flex items-baseline gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                  Where
                </p>
                {r.outlets.length > 1 && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                    {r.outlets.length} outlets
                  </span>
                )}
              </div>

              {r.outlets.length > 0 ? (
                <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                  {r.outlets.map((o, i) => (
                    <li key={i} className="border-t rule pt-3">
                      {o.label && (
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-soft)]">
                          {o.label}
                        </p>
                      )}
                      <p className="mt-1.5 text-[15px] text-[color:var(--ink)] leading-relaxed">
                        {o.address}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-base text-[color:var(--ink)] leading-relaxed">
                  {r.address}
                </p>
              )}
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
