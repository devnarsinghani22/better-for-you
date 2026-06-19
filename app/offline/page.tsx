// app/offline/page.tsx
export const dynamic = "force-static";

// noindex: this is a service-worker offline fallback, not a content page —
// keep it out of the index (no search intent, near-duplicate utility shell).
export const metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[color:var(--bg)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)]">
        Better for You · by Food Pharmer
      </p>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl tracking-[-0.02em] text-[color:var(--ink)]">
        You&rsquo;re offline
      </h1>
      <p className="mt-3 max-w-sm text-[color:var(--ink-soft)] leading-relaxed">
        Pages and products you&rsquo;ve already opened still work. Reconnect to
        browse the rest of the list.
      </p>
    </main>
  );
}
