import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b rule">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-3 flex items-center justify-between text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em]">
        <Link
          href="/"
          className="text-[color:var(--ink-soft)] hover:text-[color:var(--accent-deep)] transition-colors"
        >
          Food Pharmer · Approved
        </Link>
        <nav className="hidden sm:flex gap-5 text-[color:var(--ink-mute)]">
          <Link href="/method" className="hover:text-[color:var(--accent-deep)] transition-colors">
            Method
          </Link>
          <Link href="/about" className="hover:text-[color:var(--accent-deep)] transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-[color:var(--accent-deep)] transition-colors">
            Contact
          </Link>
        </nav>
        <a
          href="https://instagram.com/foodpharmer"
          className="text-[color:var(--ink-soft)] hover:text-[color:var(--accent-deep)] transition-colors"
          target="_blank"
          rel="noopener"
        >
          @foodpharmer →
        </a>
      </div>
    </header>
  );
}
