import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t rule mt-auto relative z-10 bg-[color:var(--bg-elev)]/40">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-12 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-8">
        <div className="md:col-span-6">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--ink)] mb-4">
            Site
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-[color:var(--accent-deep)]">
                Packaged Food
              </Link>
            </li>
            <li>
              <Link href="/v/restaurants" className="hover:text-[color:var(--accent-deep)]">
                Restaurants <span className="text-[color:var(--ink-mute)]">· soon</span>
              </Link>
            </li>
            <li>
              <Link href="/b" className="hover:text-[color:var(--accent-deep)]">
                Brands
              </Link>
            </li>
            <li>
              <Link href="/criteria" className="hover:text-[color:var(--accent-deep)]">
                Criteria
              </Link>
            </li>
            <li>
              <Link href="/oil-board" className="hover:text-[color:var(--accent-deep)]">
                Oil Board
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-[color:var(--accent-deep)]">
                Privacy
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-6">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--ink)] mb-4">
            Get in touch
          </p>
          <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed max-w-sm">
            If you have a brand,{" "}
            <a
              href="https://forms.gle/mSnD2hv6EymWoTTLA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--ink)] underline decoration-[color:var(--ink-mute)] underline-offset-2 hover:text-[color:var(--accent-deep)]"
            >
              submit it for review
            </a>
            . If it meets our criteria, we will list it.
          </p>
          <p className="mt-4 text-sm text-[color:var(--ink-soft)] leading-relaxed max-w-sm">
            For any other queries, contact us at{" "}
            <a
              href="mailto:betterforyou@foodpharmer.net"
              className="text-[color:var(--ink)] underline decoration-[color:var(--ink-mute)] underline-offset-2 hover:text-[color:var(--accent-deep)]"
            >
              betterforyou@foodpharmer.net
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
