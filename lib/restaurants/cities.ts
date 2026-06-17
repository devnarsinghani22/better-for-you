// City metadata for the restaurants vertical. Each city gets a slug (used in
// /v/restaurants/<slug>), a display name, and a scenic landmark photo sourced
// into /public/cities. Cities not listed here still render — just without a
// photo (graceful typographic fallback), so adding a new city never breaks.

export type CityMeta = {
  slug: string;
  name: string;
  image: string;
  landmark: string;
};

// Order here is the display order on the Cities index (metros first).
export const CITY_META: CityMeta[] = [
  { slug: "mumbai", name: "Mumbai", image: "/cities/mumbai.jpg", landmark: "Gateway of India" },
  { slug: "delhi", name: "Delhi", image: "/cities/delhi.jpg", landmark: "India Gate" },
  { slug: "bengaluru", name: "Bengaluru", image: "/cities/bengaluru.jpg", landmark: "Vidhana Soudha" },
  { slug: "ahmedabad", name: "Ahmedabad", image: "/cities/ahmedabad.jpg", landmark: "Sabarmati Ashram" },
  { slug: "kolkata", name: "Kolkata", image: "/cities/kolkata.jpg", landmark: "Victoria Memorial" },
  { slug: "pune", name: "Pune", image: "/cities/pune.jpg", landmark: "Shaniwar Wada" },
];

export function citySlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function cityMetaByName(name: string): CityMeta | undefined {
  const s = citySlug(name);
  return CITY_META.find((c) => c.slug === s);
}

export function cityMetaBySlug(slug: string): CityMeta | undefined {
  return CITY_META.find((c) => c.slug === slug);
}

// Rank used to order a list of city names: known metros first (CITY_META
// order), then any extras alphabetically.
export function cityRank(name: string): number {
  const i = CITY_META.findIndex((c) => c.slug === citySlug(name));
  return i < 0 ? 99 : i;
}
