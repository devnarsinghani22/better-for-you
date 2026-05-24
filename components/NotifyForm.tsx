"use client";

import { useState, useTransition } from "react";
import { submitVerticalInterest } from "@/app/v/[vertical]/actions";

export default function NotifyForm({
  vertical,
  label,
}: {
  vertical: string;
  label: string;
}) {
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

  if (done) {
    return (
      <div className="mt-8 bg-[color:var(--bg-elev)] border-2 border-[color:var(--ink)] rounded-sm p-6 max-w-md">
        <p className="font-display text-2xl tracking-tight">You&rsquo;re on the list.</p>
        <p className="mt-2 text-sm text-[color:var(--ink-soft)] leading-relaxed">
          We&rsquo;ll message you the moment Better for You {label} goes live.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-md">
      <div className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="bg-[color:var(--bg-elev)] border-2 border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors"
        />
        <input
          type="tel"
          name="phone"
          required
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="bg-[color:var(--bg-elev)] border-2 border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors"
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
      <p className="mt-3 text-xs text-[color:var(--ink-mute)] leading-relaxed">
        We&rsquo;ll only use this to tell you when {label} launches. No spam.
      </p>
    </form>
  );
}
