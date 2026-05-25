// Red corner ribbon marking items that are live on staging but NOT yet on
// production (Draft products, inactive/preview categories). It is gated to
// non-production environments, so it never appears on foodpharmer.health.
// Parent must be `relative overflow-hidden` for the diagonal to clip cleanly.
export default function StagingRibbon() {
  return (
    <div className="pointer-events-none absolute right-[-44px] top-[18px] z-20 w-[160px] rotate-45 bg-[#c81e1e] py-1 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
      New
    </div>
  );
}
