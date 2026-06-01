// Instant skeleton shown the moment a category link is tapped, so navigation
// feels immediate instead of frozen while the page data loads over the network.
export default function Loading() {
  return (
    <main className="w-full max-w-[1280px] mx-auto px-5 sm:px-10 py-10 sm:py-16 animate-pulse">
      <div className="h-3 w-28 bg-[color:var(--rule)]" />
      <div className="mt-8 h-12 sm:h-16 w-2/3 bg-[color:var(--rule)]" />
      <div className="mt-6 h-3 w-20 bg-[color:var(--rule-soft)]" />
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border rule overflow-hidden bg-[color:var(--bg-elev)]"
          >
            <div className="h-72 sm:h-80 bg-[color:var(--rule-soft)]" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-1/2 bg-[color:var(--rule)]" />
              <div className="h-6 w-3/4 bg-[color:var(--rule)]" />
              <div className="mt-4 pt-3 border-t rule">
                <div className="h-3 w-2/3 bg-[color:var(--rule-soft)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
