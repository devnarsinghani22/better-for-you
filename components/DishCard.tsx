import TagPills from "@/components/TagPills";
import type { DishRow } from "@/lib/restaurants/queries";

// Editorial dish card: photo (or typography-only fallback) above name + tags + take.
// Square-ish image area; falls back to a generous typography tile when no photo.

export default function DishCard({ dish }: { dish: DishRow }) {
  return (
    <article className="group flex flex-col h-full border rule rounded-sm overflow-hidden bg-[color:var(--bg-elev)] transition-shadow hover:shadow-[0_18px_44px_-24px_rgba(0,0,0,0.28)]">
      {dish.image_url ? (
        <div className="relative w-full aspect-[4/3] bg-[color:var(--bg)] border-b rule overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dish.image_url}
            alt={dish.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-[color:var(--ink)] text-[color:var(--bg)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em]">
              ✓ Better for You
            </span>
          </div>
        </div>
      ) : null}

      <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3">
        {!dish.image_url && (
          <span className="self-start bg-[color:var(--ink)] text-[color:var(--bg)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em]">
            ✓ Better for You
          </span>
        )}
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`font-display tracking-[-0.015em] leading-[1.1] text-[color:var(--ink)] ${
              dish.image_url
                ? "text-xl sm:text-2xl"
                : "text-2xl sm:text-3xl"
            }`}
          >
            {dish.name}
          </h3>
          {dish.price != null && (
            <span className="shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--ink-mute)]">
              ₹{Math.round(Number(dish.price))}
            </span>
          )}
        </div>
        {dish.tags.length > 0 && <TagPills tags={dish.tags} />}
        {dish.our_take && (
          <p className="text-sm leading-relaxed text-[color:var(--ink)] italic border-l-2 border-[color:var(--accent-deep)] pl-3">
            “{dish.our_take}”
          </p>
        )}
        {dish.blurb && !dish.our_take && (
          <p className="text-sm leading-relaxed text-[color:var(--ink-soft)]">
            {dish.blurb}
          </p>
        )}
      </div>
    </article>
  );
}
