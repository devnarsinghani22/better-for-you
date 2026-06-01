// Instant skeleton shown the moment a product card is tapped — the fix for the
// "tap three times" feeling, which was caused by zero feedback during the
// client-side navigation's data fetch.
export default function Loading() {
  return (
    <main className="w-full max-w-[1280px] mx-auto px-5 sm:px-10 py-10 sm:py-16 animate-pulse">
      <div className="h-3 w-32 bg-[color:var(--rule)]" />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square border rule bg-[color:var(--rule-soft)]" />
        <div className="space-y-4">
          <div className="h-4 w-1/3 bg-[color:var(--rule)]" />
          <div className="h-10 w-3/4 bg-[color:var(--rule)]" />
          <div className="mt-6 h-24 w-full bg-[color:var(--rule-soft)]" />
          <div className="h-48 w-full bg-[color:var(--rule-soft)]" />
        </div>
      </div>
    </main>
  );
}
