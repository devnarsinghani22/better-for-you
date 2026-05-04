import { createClient } from "@/lib/supabase/server";
import { getLiveCountByCategory } from "@/lib/products/queries";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const revalidate = 60;

const ruleStrip = [
  "no maida",
  "no palm oil",
  "no artificial colors",
  "no artificial flavours",
  "no artificial sweeteners",
  "no maltodextrin",
  "no thickeners",
  "added sugar capped",
  "label verified",
  "source cited",
];

const latestReels = [
  {
    igId: "DX4VuXDpaWZ",
    views: "1.4M",
    date: "3 May",
    caption:
      "What’s Inside Maggi?\n\nI don’t have a problem with Maggi. I have a problem with Maggi marketing itself as healthy. \n\nFor several years, Maggi",
  },
  {
    igId: "DXyu2GVpEd_",
    views: "1.4M",
    date: "1 May",
    caption:
      "What’s Inside Maaza?\n\nOne 600ml bottle of Maaza contains 18-20 teaspoons of total sugar. \n\nNote: The point of these videos is not so that yo",
  },
  {
    igId: "DXwBDvdOU0H",
    views: "3.1M",
    date: "30 Apr",
    caption:
      "What’s Inside Curd?\n\nGood curd is made with just two simple things: milk and active lactic cultures. That is it!\n\nIn this video, I have high",
  },
  {
    igId: "DXtqNJECcFZ",
    views: "1.2M",
    date: "29 Apr",
    caption:
      "What’s Inside Lotte Choco Pie? \n\nThe point of these videos is not so that you avoid eating these foods altogether. The point is to help you",
  },
];

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

      {/* Latest reels */}
      <section className="border-t rule">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-10 py-12 sm:py-16">
          <div className="flex items-baseline justify-between mb-7 sm:mb-9 gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)] mb-2">
                Latest from @foodpharmer
              </p>
              <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-[0.95]">
                Why we made this list.
              </h2>
            </div>
            <a
              href="https://instagram.com/foodpharmer"
              target="_blank"
              rel="noopener"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-soft)] border-b border-[color:var(--ink-soft)] pb-1 hover:text-[color:var(--accent-deep)] hover:border-[color:var(--accent-deep)] transition-colors"
            >
              View all →
            </a>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {latestReels.map((r) => (
              <a
                key={r.igId}
                href={`https://www.instagram.com/p/${r.igId}/`}
                target="_blank"
                rel="noopener"
                className="group bg-[color:var(--bg-elev)] border rule rounded-sm overflow-hidden hover:border-[color:var(--ink)] transition-colors block"
              >
                <div className="aspect-[4/5] bg-[color:var(--bg)] overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/reel-thumbs/${r.igId}.jpg`}
                    alt={r.caption.slice(0, 80)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute top-3 left-3 bg-[color:var(--ink)] text-[color:var(--bg-elev)] font-mono text-[9px] uppercase tracking-[0.22em] px-2 py-1 leading-none">
                    ▶ {r.views}
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-sm leading-snug text-[color:var(--ink-soft)] line-clamp-2 min-h-[2.5em]">
                    {r.caption}
                  </p>
                  <div className="mt-3 pt-3 border-t rule flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em]">
                    <span className="text-[color:var(--ink-mute)]">{r.date}</span>
                    <span className="text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors">
                      Watch →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Rule strip marquee */}
      <section className="border-y rule bg-[color:var(--bg-elev)]/50 overflow-hidden rise rise-3">
        <div className="flex whitespace-nowrap py-4 marquee-track">
          {[...ruleStrip, ...ruleStrip, ...ruleStrip].map((r, i) => (
            <span
              key={i}
              className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-soft)] mx-7 flex items-center gap-7"
            >
              {r}
              <span className="text-[color:var(--accent)]" aria-hidden>◆</span>
            </span>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-10 py-12 sm:py-24">
        <div className="flex items-baseline justify-between mb-8 sm:mb-10 rise rise-3">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
            The categories
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
                      <h3 className="font-display text-3xl sm:text-4xl tracking-[-0.02em] leading-tight mb-2">
                        {c.name}
                      </h3>
                      <p className="text-[color:var(--ink-soft)] text-sm sm:text-base leading-snug">
                        {c.blurb}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-mute)]">
                        {n} approved
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
