// "NEW" flag for recently added products and category sections.
// Same family as the "Better for You" pill: ink fill, mono caps, tracked.
// White text + drop shadow keep it legible when overlaid on a photo.
export default function NewBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center bg-[color:var(--ink)] text-[color:var(--bg)] font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] px-2.5 py-1 shadow-[0_2px_12px_rgba(0,0,0,0.45)] ${className}`}
    >
      New
    </span>
  );
}
