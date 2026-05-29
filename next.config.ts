import type { NextConfig } from "next";

// Edge cache headers — pages use cookies() inside createClient, so Next can't
// fully statically render them. Caching the SSR'd HTML at Vercel's edge keeps
// ~99% of traffic from touching Supabase.
const PAGE_CC = "public, s-maxage=60, stale-while-revalidate=300";
const CRITERIA_CC = "public, s-maxage=300, stale-while-revalidate=600";
const SEARCH_CC = "public, s-maxage=30, stale-while-revalidate=60";

// Public Supabase storage host. All image URLs in the DB use this origin.
// We proxy them through Vercel's edge so each cache region only pulls the
// asset from Supabase once, then serves repeat requests from the Vercel CDN.
// This is the single biggest egress lever — every additional cache hit is
// otherwise counted by Supabase as billable cached egress.
const SUPABASE_STORAGE_HOST = "eprwzftfxtkgunnkewyk.supabase.co";

const nextConfig: NextConfig = {
  // Enables React's <ViewTransition> so route changes cross-fade instead of
  // hard-cutting (removes the white flash — the biggest "this is a web page"
  // tell inside the app). Degrades gracefully where unsupported.
  experimental: {
    viewTransition: true,
  },
  async headers() {
    return [
      { source: "/", headers: [{ key: "Cache-Control", value: PAGE_CC }] },
      { source: "/c/:category", headers: [{ key: "Cache-Control", value: PAGE_CC }] },
      { source: "/c/:category/:slug", headers: [{ key: "Cache-Control", value: PAGE_CC }] },
      { source: "/criteria", headers: [{ key: "Cache-Control", value: CRITERIA_CC }] },
      { source: "/api/search", headers: [{ key: "Cache-Control", value: SEARCH_CC }] },
      // Storage proxy responses carry the Supabase-supplied Cache-Control
      // (immutable, 1y) — let Vercel cache them aggressively at the edge.
      {
        source: "/storage/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, s-maxage=31536000, immutable" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/storage/:path*",
        destination: `https://${SUPABASE_STORAGE_HOST}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
