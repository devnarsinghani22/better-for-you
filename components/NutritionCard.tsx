type NutritionData = {
  serving?: string;
  per?: "100g" | "100ml" | "serving";
  rows?: Array<{
    label: string;
    value: number | string;
    unit?: string;
    indent?: boolean;
    bold?: boolean;
    // RDA% column (per-serve or per-100g, depending on the pack). Use null /
    // omit when the brand prints a dash (e.g. for cholesterol / total sugar).
    rda?: number | string | null;
  }>;
  // Free-text footnote printed under the table (e.g. "ICMR-NIN 2020"). For
  // a clickable source URL, keep using `sourceUrl`.
  footnote?: string;
  source?: string;
  sourceUrl?: string;
};

export default function NutritionCard({ data, brand }: { data: NutritionData; brand?: string }) {
  const rows = data.rows ?? [];
  const perLabel =
    data.per === "100g"
      ? "Per 100g"
      : data.per === "100ml"
      ? "Per 100ml"
      : data.per === "serving"
      ? `Per serving${data.serving ? ` (${data.serving})` : ""}`
      : "Per 100g";

  // Render the RDA% column only when at least one row carries an RDA value.
  const hasRda = rows.some(
    (r) => r.rda !== undefined && r.rda !== null && r.rda !== "",
  );

  const renderRda = (r: (typeof rows)[number]) => {
    if (!hasRda) return null;
    if (r.rda === undefined || r.rda === null || r.rda === "") {
      return (
        <td
          className="py-2.5 px-5 text-right text-[color:var(--ink-mute)] tabular-nums"
          aria-label="not declared"
        >
          —
        </td>
      );
    }
    const isNumeric = typeof r.rda === "number";
    return (
      <td
        className={`py-2.5 px-5 text-right tabular-nums ${
          r.bold ? "font-semibold text-[color:var(--ink)]" : "text-[color:var(--ink-soft)]"
        }`}
      >
        {r.rda}
        {isNumeric ? "%" : null}
      </td>
    );
  };

  const sourceUrl = data.sourceUrl ?? data.source;

  return (
    <div className="bg-[color:var(--bg-elev)] border-2 border-[color:var(--ink)] rounded-sm overflow-hidden max-w-md">
      <div className="bg-[color:var(--ink)] text-[color:var(--bg)] px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-70 mb-0.5">
          Nutrition information
        </p>
        <p className="font-display text-xl tracking-tight leading-none">
          {perLabel}
        </p>
      </div>

      <table className="w-full text-sm">
        {hasRda && (
          <thead className="bg-[color:var(--bg)]/40 border-b border-[color:var(--ink)]/10">
            <tr>
              <th className="py-2 px-5 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]">
                Nutrient
              </th>
              <th className="py-2 px-5 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]">
                {perLabel.replace(/^Per /, "")}
              </th>
              <th className="py-2 px-5 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-mute)]">
                RDA % *
              </th>
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={`border-t border-[color:var(--ink)]/10 ${
                r.bold ? "bg-[color:var(--bg)]/50" : ""
              }`}
            >
              <td
                className={`py-2.5 px-5 ${r.indent ? "pl-9" : ""} ${
                  r.bold ? "font-semibold text-[color:var(--ink)]" : "text-[color:var(--ink-soft)]"
                }`}
              >
                {r.label}
              </td>
              <td
                className={`py-2.5 px-5 text-right tabular-nums ${
                  r.bold ? "font-semibold text-[color:var(--ink)]" : "text-[color:var(--ink)]"
                }`}
              >
                {r.value}
                {r.unit ? <span className="text-[color:var(--ink-mute)] text-xs">{r.unit}</span> : null}
              </td>
              {renderRda(r)}
            </tr>
          ))}
        </tbody>
      </table>

      {data.footnote && (
        <div className="px-5 py-3 border-t border-[color:var(--ink)]/10 text-[11px] leading-snug text-[color:var(--ink-mute)]">
          {hasRda && <span aria-hidden>* </span>}
          {data.footnote}
        </div>
      )}

      <div className="px-5 py-3 border-t border-[color:var(--ink)]/10 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] flex items-center justify-between gap-4">
        <span>{brand ? `As declared by ${brand}` : "As declared on pack"}</span>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[color:var(--accent-deep)] truncate"
          >
            source →
          </a>
        )}
      </div>
    </div>
  );
}
