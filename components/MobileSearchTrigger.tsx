"use client";

import { useEffect, useState } from "react";
import SearchBox from "@/components/SearchBox";

// Floating "search" pill at the bottom-right on mobile only. Opens a
// full-screen overlay with the existing SearchBox.
//
// Why this exists: the header SearchBox is visible only when the sticky
// header is on screen. Once a visitor scrolls into a category, they have
// to scroll back up to search again, so most don't. Clarity reported 4.8%
// search usage on a 200+ SKU catalog — this is the cheapest way to lift
// that number on the 91% of traffic that's mobile.
export default function MobileSearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Floating trigger — mobile only, hidden when overlay is open */}
      <button
        type="button"
        aria-label="Open search"
        onClick={() => setOpen(true)}
        className={`md:hidden fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-4 py-3 rounded-full shadow-[0_18px_44px_-14px_rgba(0,0,0,0.5)] font-mono text-[11px] uppercase tracking-[0.22em] active:scale-[0.97] transition-transform ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" strokeLinecap="round" />
        </svg>
        Search
      </button>

      {/* Overlay — mobile only. Click backdrop or × to close. */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-[color:var(--bg)]/95 backdrop-blur-md flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          onClick={(e) => {
            // Close only when the backdrop itself is clicked
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b rule">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
              Search
            </span>
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setOpen(false)}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink)] px-3 py-2 hover:text-[color:var(--accent-deep)]"
            >
              Close ×
            </button>
          </div>
          <div className="p-4">
            <SearchBox />
          </div>
        </div>
      )}
    </>
  );
}
