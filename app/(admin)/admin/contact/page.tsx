import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ContactInbox() {
  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold">Contact inbox</h1>
        <span className="text-xs uppercase tracking-wider text-stone-500">
          {rows?.length ?? 0} {rows?.length === 1 ? "message" : "messages"}
        </span>
      </div>
      <p className="mt-2 text-stone-600 text-sm">
        Submissions from the public <code>/contact</code> form and the
        &ldquo;notify me&rdquo; signups (tagged <code>interest:*</code>). Newest
        first. Reply by emailing the address shown (if provided).
      </p>
      <a
        href="/admin/contact/export"
        className="mt-4 inline-flex items-center gap-2 border border-stone-800 bg-stone-900 text-white px-4 py-2 text-xs uppercase tracking-wider hover:bg-stone-700"
      >
        ↓ Download all as CSV
      </a>

      {error && (
        <p className="mt-6 text-sm text-red-700 bg-red-50 border border-red-200 p-3">
          Couldn&rsquo;t load: {error.message}
        </p>
      )}

      {rows && rows.length === 0 && (
        <p className="mt-10 text-stone-500">No messages yet.</p>
      )}

      <ul className="mt-6 divide-y border bg-white">
        {rows?.map((r) => {
          const when = new Date(r.created_at).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          });
          // Clean phone from the dedicated columns when present; the digits-only
          // form makes a tap-to-WhatsApp link. Pre-migration rows have the phone
          // only inside `message`, so we fall back to showing that. Cast because
          // the generated row type predates the phone_cc / phone columns.
          const rp = r as typeof r & {
            phone_cc?: string | null;
            phone?: string | null;
          };
          const phoneText = rp.phone
            ? `${rp.phone_cc ?? ""} ${rp.phone}`.trim()
            : null;
          const waDigits = `${rp.phone_cc ?? ""}${rp.phone ?? ""}`.replace(
            /\D/g,
            "",
          );
          return (
            <li key={r.id} className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <span className="font-semibold">
                    {r.name?.trim() || "Anonymous"}
                  </span>
                  {r.email && (
                    <a
                      href={`mailto:${r.email}?subject=Re%3A%20${encodeURIComponent(r.reason ?? "Better for You by Food Pharmer")}`}
                      className="ml-2 text-sm underline text-stone-700 hover:text-stone-900"
                    >
                      {r.email}
                    </a>
                  )}
                </div>
                <div className="text-xs text-stone-500 font-mono uppercase tracking-wider">
                  {when}
                  {r.reason ? ` · ${r.reason}` : ""}
                </div>
              </div>
              {phoneText ? (
                <p className="mt-3 text-stone-800 leading-relaxed">
                  <span className="text-stone-500">Phone:</span>{" "}
                  <a
                    href={`https://wa.me/${waDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-stone-900"
                  >
                    {phoneText}
                  </a>
                </p>
              ) : (
                <p className="mt-3 whitespace-pre-wrap text-stone-800 leading-relaxed">
                  {r.message}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-8">
        <Link
          href="/admin"
          className="text-xs uppercase tracking-wider text-stone-600 hover:text-stone-900 underline"
        >
          ← back to admin
        </Link>
      </div>
    </div>
  );
}
