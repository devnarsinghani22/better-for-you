import { createClient } from "@/lib/supabase/server";
import { getLiveCountByCategory } from "@/lib/products/queries";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, slug, name, blurb, hero_image_url")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="p-12">
        <p className="font-mono text-sm text-[color:var(--danger)]">
          Could not load: {error.message}
        </p>
      </main>
    );
  }

  const list = categories ?? [];
  const counts = await getLiveCountByCategory();

  // Paneer compound: the "paneer" slug is the parent; nest other "paneer-*"
  // slugs as variants underneath it.
  const paneerParent = list.find((c) => c.slug === "paneer");
  const paneerVariants = list
    .filter((c) => c.slug !== "paneer" && c.slug.startsWith("paneer-"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const paneerTotal =
    (paneerParent ? counts.get(paneerParent.id) ?? 0 : 0) +
    paneerVariants.reduce((s, c) => s + (counts.get(c.id) ?? 0), 0);

  // Hide variant slugs from top-level index — they live inside the parent card.
  const indexEntries = list.filter(
    (c) => !(c.slug !== "paneer" && c.slug.startsWith("paneer-")),
  );

  return (
    <div className="relative z-10">
      <SiteHeader />

      {/* HERO */}
      <section>
        <div className="max-w-[1280px] mx-auto px-5 sm:px-10 pt-10 sm:pt-20 pb-6 sm:pb-10">
          {/* Title + tagline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8 items-end">
            <div className="lg:col-span-8 rise rise-1">
              <h1 className="font-display font-medium leading-[0.9] tracking-[-0.025em] text-[11.5vw] sm:text-[9.5vw] lg:text-[5.6vw] text-[color:var(--ink)]">
                Better for You
                <br />
                <em className="italic font-light whitespace-nowrap">by Food Pharmer</em>
              </h1>
            </div>

            <div className="lg:col-span-4 lg:pb-3 rise rise-2">
              <p className="font-display italic text-2xl sm:text-3xl text-[color:var(--accent-deep)] leading-none">
                Label Padhega India.
              </p>
              <p className="mt-5 text-sm text-[color:var(--ink-mute)] leading-relaxed max-w-md">
                Reviewed by{" "}
                <a
                  href="https://instagram.com/foodpharmer"
                  target="_blank"
                  rel="noopener"
                  className="text-[color:var(--ink-soft)] underline decoration-[color:var(--ink-mute)] underline-offset-2 hover:text-[color:var(--accent-deep)]"
                >
                  Food Pharmer
                </a>
                , with a team of nutrition experts and researchers.
              </p>
              <p className="mt-4 text-xs text-[color:var(--ink-mute)] leading-relaxed max-w-md">
                This list is completely non-sponsored.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES — editorial index */}
      <section className="border-t rule">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-10 pt-8 sm:pt-10 pb-16 sm:pb-24">
          <div className="flex items-end justify-between mb-8 sm:mb-12 rise rise-3">
            <h2 className="font-display text-3xl sm:text-5xl tracking-[-0.02em] leading-none">
              Categories
            </h2>
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)]">
              {indexEntries.length} sections
            </span>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {indexEntries.map((c, i) => {
              const isPaneer = c.slug === "paneer";
              const picks = isPaneer ? paneerTotal : counts.get(c.id) ?? 0;

              return (
                <li
                  key={c.id}
                  className={`group rise rise-${Math.min(i + 1, 5)} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.28)]`}
                >
                  <article className="bg-[color:var(--bg-elev)] overflow-hidden h-full flex flex-col">
                    <Link href={`/c/${c.slug}`} className="block">
                      <div className="relative aspect-[16/10] sm:aspect-[16/11] bg-[color:var(--photo-bg)] overflow-hidden">
                        {c.hero_image_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={c.hero_image_url}
                            alt={c.name}
                            loading={i === 0 ? "eager" : "lazy"}
                            decoding="async"
                            fetchPriority={i === 0 ? "high" : "auto"}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                          />
                        )}
                      </div>
                    </Link>

                    <div className="p-5 sm:p-7 flex-1 flex flex-col">
                      <Link href={`/c/${c.slug}`}>
                        <h3 className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-[0.95] text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors">
                          {c.name}
                        </h3>
                      </Link>

                      {isPaneer && paneerVariants.length > 0 ? (
                        <ul className="mt-6 border-t rule">
                          <li className="border-b rule">
                            <Link
                              href={`/c/paneer`}
                              className="flex items-center justify-between min-h-[52px] py-3 group/v"
                            >
                              <span className="font-display text-xl sm:text-2xl tracking-tight text-[color:var(--ink)] group-hover/v:text-[color:var(--accent-deep)] transition-colors truncate">
                                Regular
                              </span>
                              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)] group-hover/v:text-[color:var(--accent-deep)] transition-colors shrink-0 ml-3 whitespace-nowrap">
                                {counts.get(paneerParent?.id ?? -1) ?? 0} picks · View →
                              </span>
                            </Link>
                          </li>
                          {paneerVariants.map((v) => (
                            <li
                              key={v.id}
                              className="border-b rule last:border-b-0"
                            >
                              <Link
                                href={`/c/${v.slug}`}
                                className="flex items-center justify-between min-h-[52px] py-3 group/v"
                              >
                                <span className="font-display text-xl sm:text-2xl tracking-tight text-[color:var(--ink)] group-hover/v:text-[color:var(--accent-deep)] transition-colors whitespace-nowrap">
                                  {v.name.replace(/^Paneer · /, "")}
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)] group-hover/v:text-[color:var(--accent-deep)] transition-colors shrink-0 ml-3 whitespace-nowrap">
                                  {counts.get(v.id) ?? 0} picks · View →
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-6 pt-5 border-t rule flex items-center justify-between gap-3">
                          <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)]">
                            {picks} picks
                          </span>
                          <Link
                            href={`/c/${c.slug}`}
                            className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors"
                          >
                            View section →
                          </Link>
                        </div>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
