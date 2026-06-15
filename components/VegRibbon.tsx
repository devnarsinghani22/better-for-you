// Green corner "Pure Veg" ribbon for fully vegetarian restaurants.
// Driven by restaurants.is_pure_veg, which mirrors the "Vegetarian" tab of
// the team's Restaurant Shortlist sheet (the source of truth for this badge).
// Same geometry as NewRibbon; parent must be `relative overflow-hidden`.
// Green matches the veg-dot convention in TagPills (#16803c).

export default function VegRibbon() {
  return (
    <div className="pointer-events-none absolute right-[-44px] top-[18px] z-20 w-[160px] rotate-45 bg-[#16803c] py-1 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
      100% Veg
    </div>
  );
}
