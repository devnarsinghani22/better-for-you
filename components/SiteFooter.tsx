import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t rule mt-auto relative z-10">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div>
          <p className="font-display text-2xl tracking-tight">
            Food Pharmer Approved
          </p>
          <p className="mt-2 text-sm text-[color:var(--ink-soft)] max-w-sm">
            By Food Pharmer. A small list of packaged foods we would actually
            buy ourselves.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]">
          <div className="flex gap-4">
            <Link href="/method" className="hover:text-[color:var(--accent-deep)]">Method</Link>
            <Link href="/about" className="hover:text-[color:var(--accent-deep)]">About</Link>
            <Link href="/contact" className="hover:text-[color:var(--accent-deep)]">Contact</Link>
          </div>
          <a
            href="https://instagram.com/foodpharmer"
            target="_blank"
            rel="noopener"
            className="hover:text-[color:var(--accent-deep)] transition-colors"
          >
            instagram · @foodpharmer
          </a>
          <span>© 2026 · v1</span>
        </div>
      </div>
    </footer>
  );
}
