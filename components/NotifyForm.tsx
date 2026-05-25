"use client";

import { useState, useTransition } from "react";
import { submitVerticalInterest } from "@/app/v/[vertical]/actions";

// Self-contained "invite" card. The card border/heading stay constant; the
// form swaps to a confirmation in place. Used on the /v/<vertical> coming-soon
// pages — kept borderless-inside-a-frame so it reads as one editorial block.
export default function NotifyForm({ vertical }: { vertical: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCc, setPhoneCc] = useState("+91");
  const [phone, setPhone] = useState("");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await submitVerticalInterest({
        vertical,
        name,
        email,
        phoneCc,
        phone,
      });
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  const inputClass =
    "bg-[color:var(--bg)] border-2 border-[color:var(--ink-mute)] focus:border-[color:var(--ink)] rounded-sm px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-mute)] outline-none transition-colors";

  return (
    <div className="border-2 border-[color:var(--ink)] bg-[color:var(--bg-elev)] p-6 sm:p-7">
      <h2 className="font-display text-2xl sm:text-3xl tracking-tight leading-tight text-[color:var(--ink)]">
        {done ? "You’re on the list." : "Get the first invite."}
      </h2>

      {!done && (
        <form onSubmit={onSubmit} className="mt-5">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              autoComplete="name"
              className={inputClass}
            />
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
            <div className="flex gap-3">
              <input
                type="text"
                name="phone_cc"
                inputMode="tel"
                value={phoneCc}
                onChange={(e) => setPhoneCc(e.target.value)}
                placeholder="+91"
                aria-label="Country code"
                className={`${inputClass} w-20 text-center px-2`}
              />
              {/* WhatsApp glyph as a leading cue inside the number field (no text) */}
              <div className="relative flex-1 min-w-0">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 fill-[color:var(--ink-mute)]"
                >
                  <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.5 9.5 0 0 1-4.84-1.33l-.35-.2-3.6.94.96-3.51-.23-.36a9.46 9.46 0 0 1-1.45-5.05c0-5.23 4.26-9.49 9.5-9.49 2.54 0 4.92.99 6.71 2.79a9.43 9.43 0 0 1 2.78 6.71c0 5.23-4.26 9.5-9.49 9.5zm5.6-15.1A11.43 11.43 0 0 0 12.05 3C6.16 3 1.36 7.8 1.36 13.69c0 1.88.49 3.72 1.42 5.34L1.27 24l5.1-1.34a11.4 11.4 0 0 0 5.68 1.45h.01c5.89 0 10.69-4.8 10.69-10.69 0-2.86-1.11-5.54-3.13-7.56z" />
                </svg>
                <input
                  type="tel"
                  name="phone"
                  required
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Number"
                  autoComplete="tel-national"
                  className={`${inputClass} w-full pl-10`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="mt-1 inline-flex items-center justify-center gap-2 bg-[color:var(--ink)] text-[color:var(--bg)] px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors disabled:opacity-60"
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
      )}
    </div>
  );
}
