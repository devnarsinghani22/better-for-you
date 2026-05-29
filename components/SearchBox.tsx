"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type BrandOrCat = { slug: string; name: string };
type Hit = {
  slug: string;
  name: string;
  product_photo_url: string | null;
  brand: BrandOrCat | BrandOrCat[] | null;
  category: BrandOrCat | BrandOrCat[] | null;
};

function flatten<T>(x: T | T[] | null): T | null {
  if (Array.isArray(x)) return x[0] ?? null;
  return x;
}

const PLACEHOLDER_CYCLE = [
  "curd",
  "paneer",
  "biscuits",
  "noodles",
  "makhana",
  "tempeh",
  "tofu",
];

export default function SearchBox() {
  const router = useRouter();
  const uid = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Hit[]>([]);
  const [categories, setCategories] = useState<BrandOrCat[]>([]);
  const [loading, setLoading] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  // Index of the keyboard-highlighted option; -1 = none (focus on the raw query).
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.length > 0) return;
    const t = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_CYCLE.length);
    }, 2200);
    return () => clearInterval(t);
  }, [q]);

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 1) {
      setProducts([]);
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: ctl.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setProducts(data.products ?? []);
        setCategories(data.categories ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setProducts([]);
          setCategories([]);
        }
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      ctl.abort();
      clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const trimmed = q.trim();
  const showDropdown = open && trimmed.length >= 1;

  // Only products with a resolvable category slug are clickable/navigable.
  const validProducts = useMemo(
    () => products.filter((p) => !!flatten(p.category)?.slug),
    [products],
  );
  const hasResults = categories.length + validProducts.length > 0;

  // Flat, ordered list of navigable destinations — must mirror render order:
  // categories, then products, then the "see all" footer link. Index into this
  // drives arrow-key navigation and aria-activedescendant.
  const navItems = useMemo(() => {
    const items: { href: string }[] = [
      ...categories.map((c) => ({ href: `/c/${c.slug}` })),
      ...validProducts.map((p) => ({
        href: `/c/${flatten(p.category)!.slug}/${p.slug}`,
      })),
    ];
    if (categories.length + validProducts.length > 0) {
      items.push({ href: `/search?q=${encodeURIComponent(trimmed)}` });
    }
    return items;
  }, [categories, validProducts, trimmed]);

  // Reset the highlight whenever the result set changes.
  useEffect(() => {
    setActiveIdx(-1);
  }, [products, categories]);

  const optionId = (i: number) => `${uid}-opt-${i}`;

  // Keep the highlighted option in view within the scrollable dropdown.
  useEffect(() => {
    if (activeIdx < 0) return;
    document
      .getElementById(optionId(activeIdx))
      ?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
      return;
    }
    if (!showDropdown || navItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % navItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? navItems.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      // Let an active highlight win; otherwise the form submits to /search.
      if (activeIdx >= 0 && navItems[activeIdx]) {
        e.preventDefault();
        setOpen(false);
        router.push(navItems[activeIdx].href);
      }
    }
  }

  const catCount = categories.length;
  const allIdx = catCount + validProducts.length;

  return (
    <div ref={wrapRef} className="relative flex-1 max-w-md">
      <form
        action="/search"
        method="GET"
        role="search"
        onSubmit={() => setOpen(false)}
      >
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--ink-mute)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="site-search"
          type="search"
          name="q"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={`${uid}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={
            showDropdown && activeIdx >= 0 ? optionId(activeIdx) : undefined
          }
          placeholder={`Try '${PLACEHOLDER_CYCLE[placeholderIdx]}'…`}
          autoComplete="off"
          className="w-full bg-[color:var(--bg-elev)] border border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm pl-9 pr-3 py-2 text-[12px] sm:text-xs uppercase tracking-[0.16em] text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors min-h-[40px]"
        />
      </form>

      {showDropdown && (
        <div
          id={`${uid}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-[color:var(--bg)] border border-[color:var(--ink)] rounded-sm shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto"
        >
          {loading && (
            <div className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
              Searching…
            </div>
          )}

          {!loading && !hasResults && (
            <div className="px-4 py-4 text-sm text-[color:var(--ink-soft)] normal-case tracking-normal">
              No matches for &ldquo;{trimmed}&rdquo;.
            </div>
          )}

          {!loading && categories.length > 0 && (
            <div className="border-b rule">
              <div className="px-4 pt-3 pb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                Categories
              </div>
              {categories.map((c, i) => (
                <Link
                  key={c.slug}
                  id={optionId(i)}
                  role="option"
                  aria-selected={activeIdx === i}
                  href={`/c/${c.slug}`}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`block px-4 py-2.5 font-display text-lg tracking-tight normal-case ${
                    activeIdx === i
                      ? "bg-[color:var(--bg-elev)]"
                      : "hover:bg-[color:var(--bg-elev)]"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {!loading && validProducts.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                Products
              </div>
              {validProducts.map((p, j) => {
                const idx = catCount + j;
                const brand = flatten(p.brand);
                const cat = flatten(p.category)!;
                return (
                  <Link
                    key={`${cat.slug}/${p.slug}`}
                    id={optionId(idx)}
                    role="option"
                    aria-selected={activeIdx === idx}
                    href={`/c/${cat.slug}/${p.slug}`}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`flex items-center gap-3 px-4 py-2 normal-case tracking-normal ${
                      activeIdx === idx
                        ? "bg-[color:var(--bg-elev)]"
                        : "hover:bg-[color:var(--bg-elev)]"
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                      {p.product_photo_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.product_photo_url}
                          alt={p.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="font-display italic text-xs text-[color:var(--ink-mute)]/60 text-center px-1">
                          {brand?.name}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] truncate">
                        {brand?.name ?? "—"} · {cat.name}
                      </p>
                      <h3 className="font-display text-base tracking-tight leading-tight truncate text-[color:var(--ink)]">
                        {p.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!loading && hasResults && (
            <Link
              id={optionId(allIdx)}
              role="option"
              aria-selected={activeIdx === allIdx}
              href={`/search?q=${encodeURIComponent(trimmed)}`}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setActiveIdx(allIdx)}
              className={`block px-4 py-3 border-t rule font-mono text-[10px] uppercase tracking-[0.22em] ${
                activeIdx === allIdx
                  ? "bg-[color:var(--bg-elev)] text-[color:var(--ink)]"
                  : "text-[color:var(--ink-soft)] hover:bg-[color:var(--bg-elev)] hover:text-[color:var(--ink)]"
              }`}
            >
              See all results for &ldquo;{trimmed}&rdquo; →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
