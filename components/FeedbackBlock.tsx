"use client";

import { useEffect, useState, useTransition } from "react";
import { submitProductFeedback } from "@/app/c/[category]/[slug]/actions";

type Props = {
  productId: number;
  pathname: string;
  initialHelpful: number;
  initialUnhelpful: number;
};

const STORAGE_PREFIX = "fpa_voted_";

export default function FeedbackBlock({
  productId,
  pathname,
  initialHelpful,
  initialUnhelpful,
}: Props) {
  const [helpful, setHelpful] = useState(initialHelpful);
  const [unhelpful, setUnhelpful] = useState(initialUnhelpful);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + productId);
      if (stored === "up" || stored === "down") setVoted(stored);
    } catch {}
  }, [productId]);

  function vote(direction: "up" | "down") {
    if (voted) return;
    const isHelpful = direction === "up";
    // Optimistic UI
    if (isHelpful) setHelpful((n) => n + 1);
    else setUnhelpful((n) => n + 1);
    setVoted(direction);
    try {
      localStorage.setItem(STORAGE_PREFIX + productId, direction);
    } catch {}

    startTransition(async () => {
      const result = await submitProductFeedback(productId, isHelpful, pathname);
      if (!result.ok) {
        // Revert on failure
        if (isHelpful) setHelpful((n) => Math.max(0, n - 1));
        else setUnhelpful((n) => Math.max(0, n - 1));
        setVoted(null);
        try {
          localStorage.removeItem(STORAGE_PREFIX + productId);
        } catch {}
        setError("Couldn't save your feedback. Please try again.");
      }
    });
  }

  return (
    <section className="mt-12 border-t rule pt-10">
      <h2 className="font-display text-3xl tracking-tight">Was this helpful?</h2>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mt-1">
        Tells us if the page is doing its job
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => vote("up")}
          disabled={!!voted || pending}
          className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.22em] border-2 transition-colors ${
            voted === "up"
              ? "bg-[color:var(--lab)] text-[color:var(--bg)] border-[color:var(--lab)]"
              : "border-[color:var(--ink-mute)] text-[color:var(--ink)] hover:border-[color:var(--lab)] hover:text-[color:var(--lab)]"
          } ${voted && voted !== "up" ? "opacity-40" : ""} ${
            !voted ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <span aria-hidden>👍</span> Yes
          <span className="text-[color:var(--ink-mute)] normal-case tracking-normal font-body">
            {helpful}
          </span>
        </button>

        <button
          type="button"
          onClick={() => vote("down")}
          disabled={!!voted || pending}
          className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.22em] border-2 transition-colors ${
            voted === "down"
              ? "bg-[color:var(--danger)] text-[color:var(--bg)] border-[color:var(--danger)]"
              : "border-[color:var(--ink-mute)] text-[color:var(--ink)] hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
          } ${voted && voted !== "down" ? "opacity-40" : ""} ${
            !voted ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <span aria-hidden>👎</span> No
          <span className="text-[color:var(--ink-mute)] normal-case tracking-normal font-body">
            {unhelpful}
          </span>
        </button>

        {voted && (
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            Thanks for the signal.
          </span>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-[color:var(--danger)]">{error}</p>
      )}
    </section>
  );
}
