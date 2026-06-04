// Expectation-setting note for the restaurants vertical. Deliberately delinks
// a listing from any personal endorsement: we point at menus where better
// choices are easier to find — we don't certify kitchens or every dish.
export default function RestaurantDisclaimer() {
  return (
    <aside className="bg-[color:var(--bg-elev)] border rule rounded-sm p-5 sm:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
        Before you order
      </p>
      <p className="mt-3 text-sm sm:text-base leading-relaxed text-[color:var(--ink-soft)]">
        &ldquo;Better for You&rdquo; means better than what&rsquo;s usually
        around — not perfect. These are places where cleaner choices are easier
        to find, but the same menu may still carry sugar, maida, or deep-fried
        items, and recipes, portions, and kitchens change without notice. A
        listing is not an endorsement of everything a restaurant serves, and
        individual orders will vary. Read the menu, ask questions, and order
        what fits you.
      </p>
    </aside>
  );
}
