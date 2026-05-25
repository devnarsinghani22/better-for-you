import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t rule mt-auto relative z-10 bg-[color:var(--bg-elev)]/40">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-12 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-8">
        <div className="md:col-span-5">
          <p className="font-display text-2xl tracking-tight">
            Better for You by Food Pharmer
          </p>
          <p className="mt-3 text-sm text-[color:var(--ink-soft)] leading-relaxed max-w-sm">
            A growing list of packaged foods we would actually buy ourselves.
            Reviewed by Food Pharmer, with a team of nutrition experts and researchers.
          </p>
        </div>

        <div className="md:col-span-3">
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
              <Link href="/criteria" className="hover:text-[color:var(--accent-deep)]">
                Criteria
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4">
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
          <p className="mt-5 text-sm">
            <a
              href="https://instagram.com/foodpharmer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--ink)] underline decoration-[color:var(--ink-mute)] underline-offset-2 hover:text-[color:var(--accent-deep)]"
            >
              @foodpharmer on Instagram →
            </a>
          </p>
        </div>
      </div>

    </footer>
  );
}
