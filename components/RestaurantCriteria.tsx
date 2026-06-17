// The bar every listed restaurant clears. Shared by the Cities index and each
// city page so the copy stays in one place.
const CRITERIA = [
  "Above 4.2 stars on each of Swiggy, Zomato and Google",
  "At least 100 reviews on each of Swiggy, Zomato, and Google",
  "A surprise visit from the Food Pharmer team",
];

export default function RestaurantCriteria({
  className = "",
}: {
  className?: string;
}) {
  return (
    <section className={`max-w-2xl ${className}`}>
      <h2 className="font-display text-3xl sm:text-4xl tracking-tight mb-4 sm:mb-5">
        Our criteria
      </h2>
      <div className="bg-[color:var(--bg-elev)] border rule rounded-sm p-5">
        <ul className="space-y-2.5">
          {CRITERIA.map((c) => (
            <li key={c} className="flex gap-3">
              <span
                aria-hidden
                className="text-[color:var(--lab)] font-bold text-base leading-tight shrink-0 mt-0.5"
              >
                ✓
              </span>
              <span className="text-[color:var(--ink)] leading-relaxed">{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
