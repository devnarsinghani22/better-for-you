"use client";

import { useState, useTransition } from "react";
import { requestProduct } from "@/app/search/actions";

// Zero-result recovery: lets a visitor ask us to add the product they searched
// for. Email is optional (a request still counts as demand without it).
export default function RequestProductForm({ query }: { query: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="text-sm text-[color:var(--ink-soft)]">
        Thanks — we&rsquo;ve noted you&rsquo;re looking for{" "}
        <span className="text-[color:var(--ink)]">&ldquo;{query}&rdquo;</span>.
        {email ? " We&rsquo;ll email you if it makes the list." : ""}
      </p>
    );
  }

  return (
    <div className="max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const res = await requestProduct(query, email);
            if (res.ok) setDone(true);
            else setError(res.error);
          });
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email (optional)"
          placeholder="Email (optional — to hear when we add it)"
          className="flex-1 bg-[color:var(--bg-elev)] border-2 border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors disabled:opacity-50"
        >
          {pending ? "Sending…" : "Request →"}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-[color:var(--danger)]">{error}</p>
      )}
    </div>
  );
}
