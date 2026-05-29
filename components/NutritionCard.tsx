type NutritionData = {
  // Hard gate: this component renders an HTML nutrition TABLE, which we never
  // ship — the source of truth is always the brand's printed label IMAGE
  // (products.label_image_url). The product page only mounts this when
  // nutrition.live === true. This `live` flag is the in-component backstop:
  // if it isn't explicitly true, the component refuses to render. Do not
  // remove without removing the table itself.
  live?: boolean;
  serving?: string;
  per?: "100g" | "100ml" | "serving";
  rows?: Array<{
    label: string;
    value: number | string;
    unit?: string;
    indent?: boolean;
    bold?: boolean;
  }>;
  source?: string;
};

export default function NutritionCard({ data, brand }: { data: NutritionData; brand?: string }) {
  // Backstop the "never render a nutrition table" rule at the component level,
  // not just at the call site. If a caller forgets the live gate, render
  // nothing rather than a fabricated-looking table.
  if (data?.live !== true) return null;

  const rows = data.rows ?? [];
  const perLabel =
    data.per === "100g"
      ? "Per 100g"
      : data.per === "100ml"
      ? "Per 100ml"
      : data.per === "serving"
      ? `Per serving${data.serving ? ` (${data.serving})` : ""}`
      : "Per 100g";

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
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-5 py-3 border-t border-[color:var(--ink)]/10 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] flex items-center justify-between gap-4">
        <span>{brand ? `As declared by ${brand}` : "As declared on pack"}</span>
        {data.source && (
          <a
            href={data.source}
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
