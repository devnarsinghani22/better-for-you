import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Contact | Better for You by Food Pharmer",
  description: "Get in touch with Food Pharmer about a product or a tip.",
};

async function submitContact(formData: FormData) {
  "use server";
  const message = String(formData.get("message") ?? "").trim();
  if (message.length < 4) return;

  const sb = createAdminClient();
  await sb.from("contact_submissions").insert({
    name: String(formData.get("name") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    reason: String(formData.get("reason") ?? "").trim() || null,
    message,
  });
  redirect("/contact?sent=1");
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const sp = await searchParams;
  const sent = sp.sent === "1";

  return (
    <>
      <SiteHeader />
      <main className="max-w-[700px] mx-auto px-6 sm:px-10 py-16 relative z-10">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--ink-mute)] hover:text-[color:var(--accent-deep)]"
        >
          ← Home
        </Link>

        <h1 className="font-display text-5xl sm:text-7xl tracking-[-0.02em] leading-[0.95] mt-8">
          Get in touch.
        </h1>
        <p className="mt-6 text-[color:var(--ink-soft)] leading-relaxed">
          Found a product on this site that does not actually meet our rules?
          Want to suggest a category or a brand we should look at? Tell us
          here.
        </p>

        {sent ? (
          <div className="mt-10 bg-[color:var(--bg-elev)] border rule p-8 rounded-sm">
            <p className="font-display text-2xl">Thanks. We got your message.</p>
            <p className="mt-2 text-[color:var(--ink-soft)]">
              We read every note and try to respond within a week.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.22em] underline hover:text-[color:var(--accent-deep)]"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <form action={submitContact} className="mt-10 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name (optional)</label>
              <input
                name="name"
                className="w-full border rule rounded px-3 py-2 bg-[color:var(--bg-elev)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Email (optional, only if you want a reply)
              </label>
              <input
                name="email"
                type="email"
                className="w-full border rule rounded px-3 py-2 bg-[color:var(--bg-elev)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">What is this about?</label>
              <select
                name="reason"
                className="w-full border rule rounded px-3 py-2 bg-[color:var(--bg-elev)]"
              >
                <option value="">Choose one</option>
                <option value="error">A product on the site is wrong</option>
                <option value="suggest">Suggesting a product or category</option>
                <option value="press">Press / partnership</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Message *</label>
              <textarea
                name="message"
                rows={6}
                required
                minLength={4}
                maxLength={5000}
                className="w-full border rule rounded px-3 py-2 bg-[color:var(--bg-elev)] font-body text-base"
                placeholder="Tell us what you saw or what you want to suggest."
              />
            </div>
            <button
              type="submit"
              className="bg-[color:var(--ink)] text-[color:var(--bg)] px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:bg-[color:var(--accent-deep)] transition-colors"
            >
              Send message →
            </button>
          </form>
        )}

        <p className="mt-12 text-sm text-[color:var(--ink-mute)] font-mono uppercase tracking-[0.18em]">
          You can also reach us on{" "}
          <a
            href="https://instagram.com/foodpharmer"
            target="_blank"
            rel="noopener"
            className="underline hover:text-[color:var(--accent-deep)]"
          >
            Instagram
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
