"use client";

import { useEffect, useState } from "react";
import { INGREDIENT_LANGUAGES } from "@/lib/i18n/languages";

/**
 * The ingredient list with an inline language toggle. English is the verbatim
 * source; other languages are pre-translated and stored in the product's
 * `ingredients_i18n`. Only languages that actually have a translation for THIS
 * product render as pills, so a partially-translated catalogue never shows a
 * dead button. The chosen language is remembered across products via
 * localStorage. Translations carry a "check the pack" note — they are an aid,
 * not the legal source of truth.
 */
export default function IngredientText({
  raw,
  i18n,
}: {
  raw: string;
  i18n: Record<string, string> | null;
}) {
  const available = INGREDIENT_LANGUAGES.filter(
    (l) => l.code === "en" || (i18n && i18n[l.code]),
  );
  const [lang, setLang] = useState("en");

  // Restore the reader's last choice after hydration (initial render is always
  // English on both server and client, so there's no hydration mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ingredientLang");
      if (saved && available.some((l) => l.code === saved)) setLang(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (code: string) => {
    setLang(code);
    try {
      localStorage.setItem("ingredientLang", code);
    } catch {}
  };

  const text = lang === "en" ? raw : i18n?.[lang] ?? raw;

  return (
    <div className="mt-5">
      {available.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {available.map((l) => (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              aria-pressed={lang === l.code}
              onClick={() => choose(l.code)}
              className={`font-mono text-[12px] tracking-[0.04em] px-3 py-1.5 border rule rounded-sm transition-colors ${
                lang === l.code
                  ? "bg-[color:var(--ink)] text-[color:var(--bg)] border-[color:var(--ink)]"
                  : "bg-[color:var(--bg-elev)] text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] hover:border-[color:var(--accent-deep)]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
      <div className="bg-[color:var(--bg-elev)] border rule rounded-sm p-6">
        <p
          lang={lang}
          className="text-base sm:text-lg text-[color:var(--ink)] leading-relaxed"
        >
          {text}
        </p>
        {lang !== "en" && (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]">
            Machine-assisted translation · always check the printed pack
          </p>
        )}
      </div>
    </div>
  );
}
