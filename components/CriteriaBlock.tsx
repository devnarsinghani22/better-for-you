import { createClient } from "@/lib/supabase/server";

export default async function CriteriaBlock({
  categoryId,
  variant = "full",
  productMode = false,
}: {
  categoryId: number | null;
  variant?: "full" | "compact";
  productMode?: boolean;
}) {
  if (categoryId == null) return null;

  const sb = await createClient();
  const { data: rules } = await sb
    .from("category_rules")
    .select("id, code, description")
    .eq("active", true)
    .eq("category_id", categoryId)
    .order("display_order", { ascending: true });

  if (!rules || rules.length === 0) return null;

  return (
    <section className={variant === "compact" ? "" : "mt-12 border-t rule pt-10"}>
      {variant === "full" && productMode && (
        <div className="mb-6">
          <h2 className="font-display text-3xl tracking-tight">
            What this product passed
          </h2>
          <p className="text-sm text-[color:var(--ink-soft)] mt-2 max-w-2xl">
            Every check below was confirmed for this exact product before we
            put it on the site.
          </p>
        </div>
      )}

      <div className="bg-[color:var(--bg-elev)] border rule rounded-sm p-5">
        <ul className="space-y-2.5">
          {rules.map((r) => (
            <li key={r.id} className="flex gap-3">
              <span
                aria-hidden
                className="text-[color:var(--lab)] font-bold text-base leading-tight shrink-0 mt-0.5"
              >
                ✓
              </span>
              <span className="text-[color:var(--ink)] leading-relaxed">
                {r.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
