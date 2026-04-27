import { createClient } from "@/lib/supabase/server";

export default async function CriteriaBlock({
  categoryId,
  variant = "full",
}: {
  categoryId: number | null;
  variant?: "full" | "compact";
}) {
  const sb = await createClient();
  const { data: rules } = await sb
    .from("category_rules")
    .select("id, code, description, category_id, is_required")
    .eq("active", true)
    .or(`category_id.eq.${categoryId},category_id.is.null`)
    .order("category_id", { ascending: false, nullsFirst: false })
    .order("display_order", { ascending: true });

  if (!rules || rules.length === 0) return null;

  const perCategory = rules.filter((r) => r.category_id === categoryId);
  const universal = rules.filter((r) => r.category_id === null);

  return (
    <section className={variant === "compact" ? "" : "mt-12 border-t rule pt-10"}>
      {variant === "full" && (
        <div className="mb-6">
          <h2 className="font-display text-3xl tracking-tight">What we look for</h2>
          <p className="text-sm text-[color:var(--ink-soft)] mt-2 max-w-2xl">
            These are the rules a product has to meet for us to approve it.
            Some apply to every product. Some are specific to this category.
          </p>
        </div>
      )}

      {perCategory.length > 0 && (
        <div className="mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-3">
            For this category
          </div>
          <ul className="space-y-2.5">
            {perCategory.map((r) => (
              <li key={r.id} className="flex gap-3">
                <span
                  aria-hidden
                  className="text-[color:var(--lab)] font-mono text-sm leading-relaxed shrink-0"
                >
                  ✓
                </span>
                <span className="text-[color:var(--ink-soft)] leading-relaxed">
                  {r.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-3">
          For every product on this site
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {universal.map((r) => (
            <li key={r.id} className="flex gap-3">
              <span
                aria-hidden
                className="text-[color:var(--lab)] font-mono text-sm leading-relaxed shrink-0"
              >
                ✓
              </span>
              <span className="text-[color:var(--ink-soft)] leading-relaxed text-sm">
                {r.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
