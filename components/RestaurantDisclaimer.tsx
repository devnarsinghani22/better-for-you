// Expectation-setting note for the restaurants vertical. Deliberately delinks
// a listing from any personal endorsement: we point at menus where better
// choices are easier to find — we don't certify kitchens or every dish.
export default function RestaurantDisclaimer() {
  return (
    <aside className="bg-[color:var(--bg-elev)] border-l-2 border-[color:var(--accent-deep)] rounded-sm p-4 sm:p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
        Before you order
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
        We read menus and point you to better choices — we don&rsquo;t run
        these kitchens. Menus change, orders vary, and you&rsquo;ll still find
        sugar, maida, and fried food here. Better, not perfect — order what
        fits you.
      </p>
    </aside>
  );
}
