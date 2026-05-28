// Editorial-style tag pills for dishes and restaurants.
// Dietary tags get a colored dot (Indian veg/non-veg convention);
// everything else renders as a plain mono uppercase chip.

const DIETARY: Record<string, { dot: string; label: string }> = {
  vegan: { dot: "#16803c", label: "Vegan" },
  vegetarian: { dot: "#16803c", label: "Veg" },
  veg: { dot: "#16803c", label: "Veg" },
  egg: { dot: "#d97706", label: "Egg" },
  chicken: { dot: "#b91c1c", label: "Chicken" },
  fish: { dot: "#b91c1c", label: "Fish" },
  prawn: { dot: "#b91c1c", label: "Prawn" },
  mutton: { dot: "#b91c1c", label: "Mutton" },
  lamb: { dot: "#b91c1c", label: "Lamb" },
  "non-veg": { dot: "#b91c1c", label: "Non-veg" },
  jain: { dot: "#f59e0b", label: "Jain" },
};

const PLAIN_LABEL: Record<string, string> = {
  "gluten-free": "GF",
  "dairy-free": "Dairy-free",
  "vegan-friendly": "Vegan-friendly",
  "jain-friendly": "Jain-friendly",
  healthy: "Healthy",
  organic: "Organic",
  seasonal: "Seasonal",
};

function prettify(raw: string): string {
  return raw
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function TagPills({
  tags,
  size = "sm",
}: {
  tags: string[];
  size?: "sm" | "xs";
}) {
  if (!tags || tags.length === 0) return null;
  const text = size === "xs" ? "text-[9px]" : "text-[10px]";
  const py = size === "xs" ? "py-[2px]" : "py-[3px]";

  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      {tags.map((raw) => {
        const key = raw.toLowerCase().trim();
        const diet = DIETARY[key];
        if (diet) {
          return (
            <li
              key={raw}
              className={`inline-flex items-center gap-1.5 border rule px-2 ${py} font-mono ${text} uppercase tracking-[0.18em] text-[color:var(--ink)] bg-[color:var(--bg)]`}
            >
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: diet.dot }}
              />
              {diet.label}
            </li>
          );
        }
        const label = PLAIN_LABEL[key] ?? prettify(key);
        return (
          <li
            key={raw}
            className={`inline-flex items-center border rule px-2 ${py} font-mono ${text} uppercase tracking-[0.18em] text-[color:var(--ink-mute)] bg-[color:var(--bg)]`}
          >
            {label}
          </li>
        );
      })}
    </ul>
  );
}
