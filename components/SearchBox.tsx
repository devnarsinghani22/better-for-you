"use client";

import { useEffect, useRef, useState } from "react";
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

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Hit[]>([]);
  const [categories, setCategories] = useState<BrandOrCat[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
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
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const trimmed = q.trim();
  const showDropdown = open && trimmed.length >= 2;
  const hasResults = products.length + categories.length > 0;

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
          placeholder="Try 'pintola', 'paneer', 'palm oil'…"
          autoComplete="off"
          className="w-full bg-[color:var(--bg-elev)] border border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm px-3 py-2 text-[12px] sm:text-xs uppercase tracking-[0.16em] text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors min-h-[40px]"
        />
      </form>

      {showDropdown && (
        <div
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
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/c/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 hover:bg-[color:var(--bg-elev)] font-display text-lg tracking-tight normal-case"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {!loading && products.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                Products
              </div>
              {products.map((p) => {
                const brand = flatten(p.brand);
                const cat = flatten(p.category);
                if (!cat?.slug) return null;
                return (
                  <Link
                    key={`${cat.slug}/${p.slug}`}
                    href={`/c/${cat.slug}/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[color:var(--bg-elev)] normal-case tracking-normal"
                  >
                    <div className="w-12 h-12 bg-white border rule rounded-sm flex items-center justify-center shrink-0">
                      {p.product_photo_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.product_photo_url}
                          alt=""
                          className="max-w-full max-h-full object-contain p-1"
                        />
                      ) : (
                        <span className="font-display italic text-xs text-[color:var(--ink-mute)]/60 text-center px-1">
                          {brand?.name}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] truncate">
                        {brand?.name ?? "—"} · {cat?.name}
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
              href={`/search?q=${encodeURIComponent(trimmed)}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 border-t rule font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-soft)] hover:bg-[color:var(--bg-elev)] hover:text-[color:var(--ink)]"
            >
              See all results for &ldquo;{trimmed}&rdquo; →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
