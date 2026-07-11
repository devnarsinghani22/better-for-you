"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestOilBoards } from "@/app/oil-boards/actions";

// Email-only capture for the Oil Boards. On success the card swaps in place to
// a "check your inbox" confirmation — no download link is ever shown; the PDF
// arrives by email. Mirrors NotifyForm's frame + in-place confirmation.
export default function OilBoardsForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — hidden from humans
  const [agreed, setAgreed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await requestOilBoards({ email, website });
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  const inputClass =
    "bg-[color:var(--bg)] border-2 border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors";

  return (
    <div className="border-2 border-[color:var(--ink)] bg-[color:var(--bg-elev)] p-6 sm:p-7">
      <h2 className="font-display text-2xl sm:text-3xl tracking-tight leading-tight text-[color:var(--ink)]">
        {done ? "Check your inbox." : "Get the Oil Boards."}
      </h2>

      {done ? (
        <p className="mt-3 text-[color:var(--ink-soft)] leading-relaxed">
          We&rsquo;ve emailed the PDF to{" "}
          <span className="text-[color:var(--ink)]">{email}</span>. If it
          isn&rsquo;t there in a few minutes, check your spam folder.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5">
          <p className="text-[color:var(--ink-soft)] leading-relaxed mb-4">
            Enter your email and we&rsquo;ll send the Oil Boards PDF straight to
            your inbox.
          </p>
          {/* Honeypot: visually hidden + untabbable; bots that autofill every
              field trip it and get a silent fake success server-side. */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
          />
          <div className="flex flex-col gap-3">
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => {
                e.currentTarget.setCustomValidity("");
                setEmail(e.target.value);
              }}
              onInvalid={(e) =>
                e.currentTarget.setCustomValidity(
                  "Please enter a valid email address.",
                )
              }
              placeholder="Email"
              autoComplete="email"
              className={inputClass}
            />
            <label className="flex items-start gap-2 text-xs text-[color:var(--ink-soft)] leading-relaxed">
              <input
                type="checkbox"
                name="consent"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--ink)]"
              />
              <span>
                I agree to receive the Oil Boards by email. We won&rsquo;t share
                your details or spam you. See our{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-[color:var(--accent-deep)]"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            <button
              type="submit"
              disabled={pending}
              className="mt-1 inline-flex items-center justify-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors disabled:opacity-60"
            >
              {pending ? "Sending…" : "Email me the PDF →"}
            </button>
          </div>
          {error && (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--danger)]">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
