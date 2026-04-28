import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t rule mt-auto relative z-10 bg-[color:var(--bg-elev)]/40">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-12 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-8">
        <div className="md:col-span-5">
          <p className="font-display text-2xl tracking-tight">
            Food Pharmer Approved
          </p>
          <p className="mt-3 text-sm text-[color:var(--ink-soft)] leading-relaxed max-w-sm">
            A small list of packaged foods we would actually buy ourselves.
            Reviewed by Revant Himatsingka and a team of qualified
            nutritionists.
          </p>
          <p className="mt-4 text-xs text-[color:var(--ink-mute)] leading-relaxed max-w-sm">
            We are not affiliated with, sponsored by, or paid by any of the
            brands listed. Approvals are editorial. Recipes can change — always
            re-read the pack.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-3">
            Site
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-[color:var(--accent-deep)]">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[color:var(--accent-deep)]">
                About
              </Link>
            </li>
            <li>
              <Link href="/method" className="hover:text-[color:var(--accent-deep)]">
                Our method
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[color:var(--accent-deep)]">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-3">
            Find Food Pharmer
          </p>
          <a
            href="https://instagram.com/foodpharmer"
            target="_blank"
            rel="noopener"
            className="text-sm hover:text-[color:var(--accent-deep)] transition-colors"
          >
            instagram · @foodpharmer →
          </a>
          <p className="mt-6 font-display italic text-2xl text-[color:var(--accent-deep)]">
            Label Padhega India.
          </p>
        </div>
      </div>

      <div className="border-t rule">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
          <span>© 2026 · Food Pharmer Approved · v1</span>
          <span>Made in India · Label Padhega India</span>
        </div>
      </div>
    </footer>
  );
}
