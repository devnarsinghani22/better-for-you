import type { NextConfig } from "next";

// Edge cache headers — pages use cookies() inside createClient, so Next can't
// fully statically render them. Caching the SSR'd HTML at Vercel's edge keeps
// ~99% of traffic from touching Supabase.
const PAGE_CC = "public, s-maxage=60, stale-while-revalidate=300";
const CRITERIA_CC = "public, s-maxage=300, stale-while-revalidate=600";
const SEARCH_CC = "public, s-maxage=30, stale-while-revalidate=60";

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/", headers: [{ key: "Cache-Control", value: PAGE_CC }] },
      { source: "/c/:category", headers: [{ key: "Cache-Control", value: PAGE_CC }] },
      { source: "/c/:category/:slug", headers: [{ key: "Cache-Control", value: PAGE_CC }] },
      { source: "/criteria", headers: [{ key: "Cache-Control", value: CRITERIA_CC }] },
      { source: "/api/search", headers: [{ key: "Cache-Control", value: SEARCH_CC }] },
    ];
  },
};

export default nextConfig;
