"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import NewRibbon from "@/components/NewRibbon";
import type { RestaurantCard } from "@/lib/restaurants/queries";

// Metros first, then anything else alphabetically.
const CITY_ORDER = ["Mumbai", "Delhi", "Bengaluru", "Kolkata", "Hyderabad"];

type Filter = {
  city: string | null; // null = all cities
  cuisine: string | null;
  veganOnly: boolean;
};

function uniq<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}

function sortCities(cities: string[]): string[] {
  return cities.sort((a, b) => {
    const ia = CITY_ORDER.indexOf(a);
    const ib = CITY_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
}

function FilterChip({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 border rule font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
        active
          ? "bg-[color:var(--ink)] text-[color:var(--bg)] border-[color:var(--ink)]"
          : "bg-[color:var(--bg)] text-[color:var(--ink)] hover:border-[color:var(--accent-deep)] hover:text-[color:var(--accent-deep)]"
      }`}
    >
      <span>{label}</span>
      {count != null && (
        <span
          className={`font-mono text-[10px] ${
            active ? "text-[color:var(--bg)]/70" : "text-[color:var(--ink-mute)]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function RestaurantsExplorer({
  restaurants,
}: {
  restaurants: RestaurantCard[];
}) {
  const [filter, setFilter] = useState<Filter>({
    city: null,
    cuisine: null,
    veganOnly: false,
  });

  const allCities = useMemo(
    () => sortCities(uniq(restaurants.map((r) => r.city))),
    [restaurants]
  );
  const allCuisines = useMemo(
    () =>
      uniq(
        restaurants.map((r) => r.cuisine).filter((c): c is string => !!c)
      ).sort(),
    [restaurants]
  );

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (filter.city && r.city !== filter.city) return false;
      if (filter.cuisine && r.cuisine !== filter.cuisine) return false;
      if (filter.veganOnly) {
        const tags = r.tags.map((t) => t.toLowerCase());
        if (!tags.includes("vegan") && !tags.includes("vegan-friendly"))
          return false;
      }
      return true;
    });
  }, [restaurants, filter]);

  const cityCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of restaurants) m.set(r.city, (m.get(r.city) ?? 0) + 1);
    return m;
  }, [restaurants]);

  const byCity = useMemo(() => {
    const m = new Map<string, RestaurantCard[]>();
    for (const r of filtered) {
      if (!m.has(r.city)) m.set(r.city, []);
      m.get(r.city)!.push(r);
    }
    return m;
  }, [filtered]);

  const visibleCities = sortCities([...byCity.keys()]);

  return (
    <>
      {/* Filter rail */}
      <div className="mt-8 sm:mt-12 border-t border-b rule py-4 sm:py-5">
        <div className="flex flex-col gap-3">
          {/* Cities */}
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="hidden sm:inline shrink-0 mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
              City
            </span>
            <div className="flex-1 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <FilterChip
                label="All cities"
                active={filter.city === null}
                count={restaurants.length}
                onClick={() => setFilter((f) => ({ ...f, city: null }))}
              />
              {allCities.map((c) => (
                <FilterChip
                  key={c}
                  label={c}
                  active={filter.city === c}
                  count={cityCounts.get(c) ?? 0}
                  onClick={() => setFilter((f) => ({ ...f, city: c }))}
                />
              ))}
            </div>
          </div>

          {allCuisines.length > 0 && (
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="hidden sm:inline shrink-0 mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                Cuisine
              </span>
              <div className="flex-1 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <FilterChip
                  label="All cuisines"
                  active={filter.cuisine === null}
                  onClick={() => setFilter((f) => ({ ...f, cuisine: null }))}
                />
                {allCuisines.map((c) => (
                  <FilterChip
                    key={c}
                    label={c}
                    active={filter.cuisine === c}
                    onClick={() => setFilter((f) => ({ ...f, cuisine: c }))}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() =>
                setFilter((f) => ({ ...f, veganOnly: !f.veganOnly }))
              }
              aria-pressed={filter.veganOnly}
              className={`inline-flex items-center gap-2 px-3 py-1.5 border rule font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                filter.veganOnly
                  ? "bg-[#16803c] text-white border-[#16803c]"
                  : "bg-[color:var(--bg)] text-[color:var(--ink)] hover:border-[#16803c]"
              }`}
            >
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  backgroundColor: filter.veganOnly ? "#fff" : "#16803c",
                }}
              />
              Vegan-friendly
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
              {filtered.length} {filtered.length === 1 ? "place" : "places"}
            </span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-20 text-center">
          <p className="font-display text-3xl text-[color:var(--ink)]">
            Nothing matches yet.
          </p>
          <p className="mt-3 text-[color:var(--ink-soft)]">
            Loosen a filter, or check back as we add more.
          </p>
        </div>
      ) : (
        visibleCities.map((city) => {
          const list = byCity.get(city)!;
          return (
            <section key={city} className="mt-12 sm:mt-16">
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
                      className="relative flex flex-col h-full border rule rounded-sm overflow-hidden bg-[color:var(--bg-elev)] transition-all duration-300 hover:border-[color:var(--accent-deep)] hover:shadow-[0_22px_56px_-26px_rgba(0,0,0,0.32)]"
                    >
                      {r.is_new && <NewRibbon />}
                      {/* Image / typography fallback */}
                      <div className="relative w-full aspect-[5/3] bg-[color:var(--bg)] border-b rule overflow-hidden">
                        {(r.card_image_url || r.hero_image_url) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.card_image_url ?? r.hero_image_url!}
                            alt={r.name}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                            <span className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-[1] text-[color:var(--ink-soft)]">
                              {r.name}
                            </span>
                          </div>
                        )}
                        {r.cuisine && (
                          <span className="absolute top-3 left-3 bg-[color:var(--ink)] text-[color:var(--bg)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em]">
                            {r.cuisine}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 p-5 sm:p-6 flex flex-col">
                        {r.area && (
                          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                            {r.area}
                          </span>
                        )}
                        <h3 className="mt-2 font-display text-2xl sm:text-3xl tracking-[-0.02em] leading-[1.02] text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors">
                          {r.name}
                        </h3>
                        {r.tagline && (
                          <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)] line-clamp-2">
                            {r.tagline}
                          </p>
                        )}

                        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                            {r.approvedCount}{" "}
                            {r.approvedCount === 1 ? "dish" : "dishes"}
                            {r.price_band ? ` · ${r.price_band}` : ""}
                          </span>
                          <span
                            aria-hidden
                            className="font-mono text-[13px] text-[color:var(--ink-mute)] group-hover:text-[color:var(--accent-deep)] transition-colors"
                          >
                            View →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </>
  );
}
