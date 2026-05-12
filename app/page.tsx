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

  return (
    <div className="relative z-10">
      <SiteHeader />

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-10 pt-10 sm:pt-24 pb-10 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-6 sm:gap-y-8 items-end">
          <div className="lg:col-span-8 rise rise-1">
            <h1 className="font-display font-medium leading-[0.92] tracking-[-0.02em] text-[11.5vw] sm:text-[10vw] lg:text-[7.2vw] text-[color:var(--ink)]">
              Products
              <br />
              <em className="italic font-light">Food Pharmer</em>
              <br />
              would actually{" "}
              <span className="relative inline-block">
                buy.
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-[6px] bg-[color:var(--accent)]/70 -z-10 translate-y-[2px]"
                />
              </span>
            </h1>
          </div>

          <div className="lg:col-span-4 lg:pb-3 rise rise-2">
            <p className="text-lg sm:text-xl leading-relaxed text-[color:var(--ink-soft)] max-w-md font-normal">
              A small list of packaged foods that meet Food Pharmer&rsquo;s
              criteria. We read the ingredients so you don&rsquo;t have to.
              Every product links back to where we read it.
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
              </a>{" "}
              and a team of qualified nutritionists.
            </p>
            <p className="mt-5 font-display italic text-2xl text-[color:var(--accent-deep)]">
              Label Padhega India.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-10 py-12 sm:py-24">
        <div className="flex items-baseline justify-between mb-8 sm:mb-10 rise rise-3">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
            Categories
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
            v1 · {list.length} live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {list.map((c, i) => {
            const n = counts.get(c.id) ?? 0;
            return (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className={`group relative bg-[color:var(--bg-elev)] border rule rounded-sm flex flex-col min-h-[220px] overflow-hidden hover:border-[color:var(--ink)] transition-colors rise rise-${Math.min(i + 1, 5)} block`}
              >
                <div className="flex flex-1">
                  {c.hero_image_url && (
                    <div className="relative w-[44%] shrink-0 overflow-hidden bg-[color:var(--bg)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.hero_image_url}
                        alt={c.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      {c.slug === "paneer" && (
                        <div className="absolute top-3 left-3 z-10">
                          <div className="border-2 border-[color:var(--lab)] text-[color:var(--lab)] font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-1 leading-none bg-[color:var(--bg-elev)]">
                            Lab tested ✓
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-tight">
                        {c.name}
                      </h3>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                        {n} picks
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
