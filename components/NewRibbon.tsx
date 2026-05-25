// Red corner "NEW" ribbon for recently added products and category sections.
// Driven by the `is_new` flag (works on prod and staging alike).
// Parent must be `relative overflow-hidden` for the diagonal to clip cleanly.
export default function NewRibbon() {
  return (
    <div className="pointer-events-none absolute right-[-44px] top-[18px] z-20 w-[160px] rotate-45 bg-[#c81e1e] py-1 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
      New
    </div>
  );
}
