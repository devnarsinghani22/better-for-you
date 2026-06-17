import Link from "next/link";
import VegRibbon from "@/components/VegRibbon";
import type { RestaurantCard as RestaurantCardType } from "@/lib/restaurants/queries";

// Single restaurant tile — image (if any), name, price, and a solid CTA whose
// label carries the dish count so the click clearly promises recommendations.
export default function RestaurantCard({ r }: { r: RestaurantCardType }) {
  const img = r.card_image_url ?? r.hero_image_url ?? null;
  return (
    <Link
      href={`/r/${r.slug}`}
      className="group relative flex flex-col h-full border rule rounded-sm overflow-hidden bg-[color:var(--bg-elev)] transition-all duration-300 hover:border-[color:var(--accent-deep)] hover:shadow-[0_22px_56px_-26px_rgba(0,0,0,0.32)]"
    >
      {r.is_pure_veg && <VegRibbon />}
      {img && (
        <div className="relative w-full aspect-[5/3] bg-[color:var(--bg)] border-b rule overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={r.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className={`flex-1 flex flex-col ${img ? "p-5 sm:p-6" : "p-6 sm:p-8"}`}>
        <h3
          className={`mt-2 font-display tracking-[-0.02em] leading-[1.02] text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors ${
            img ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
          }`}
        >
          {r.name}
        </h3>
        <div className="mt-auto pt-5">
          {r.price_band && (
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
              {r.price_band}
            </div>
          )}
          <span className="flex items-center justify-center gap-1.5 bg-[color:var(--ink)] text-[color:var(--bg)] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] group-hover:bg-[color:var(--accent-deep)] transition-colors">
            View {r.approvedCount}{" "}
            {r.approvedCount === 1 ? "dish" : "dishes"}
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
