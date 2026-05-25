"use client";

import { useState, useTransition } from "react";
import { submitVerticalInterest } from "@/app/v/[vertical]/actions";

// Self-contained "invite" card. The card border/heading stay constant; the
// form swaps to a confirmation in place. Used on the /v/<vertical> coming-soon
// pages — kept borderless-inside-a-frame so it reads as one editorial block.
export default function NotifyForm({ vertical }: { vertical: string }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await submitVerticalInterest({ vertical, email, phone });
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  return (
    <div className="border-2 border-[color:var(--ink)] bg-[color:var(--bg-elev)] p-6 sm:p-7">
      <h2 className="font-display text-2xl sm:text-3xl tracking-tight leading-tight text-[color:var(--ink)]">
        {done ? "You’re on the list." : "Get the first invite."}
      </h2>

      {!done && (
        <>
          <form onSubmit={onSubmit} className="mt-5">
            <div className="flex flex-col gap-3">
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="bg-[color:var(--bg)] border-2 border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors"
              />
              <input
                type="tel"
                name="phone"
                required
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="bg-[color:var(--bg)] border-2 border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors disabled:opacity-60"
              >
                {pending ? "Saving…" : "Notify me →"}
              </button>
            </div>
            {error && (
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--danger)]">
                {error}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}
