import { createAdminClient } from "@/lib/supabase/admin";

// CSV export of the whole contact inbox (notify-me signups + brand/contact
// messages). Lives under /admin, so the middleware auth gate protects it.
// Supabase is the source of truth; this is the one-click download.
export const dynamic = "force-dynamic";

type Row = {
  created_at?: string | null;
  name?: string | null;
  email?: string | null;
  phone_cc?: string | null;
  phone?: string | null;
  reason?: string | null;
  message?: string | null;
  user_agent?: string | null;
};

// RFC-4180 field escaping: wrap in quotes, double any inner quotes.
function csvField(value: unknown): string {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const admin = createAdminClient();
  // select * so this keeps working whether or not phone_cc/phone are migrated.
  const { data, error } = await admin
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(`Could not export: ${error.message}`, { status: 500 });
  }

  const header = [
    "Date",
    "Name",
    "Email",
    "Extension",
    "Phone",
    "Reason",
    "Message",
    "User agent",
  ];
  const lines = [header.map(csvField).join(",")];
  for (const r of (data ?? []) as Row[]) {
    lines.push(
      [
        r.created_at,
        r.name,
        r.email,
        r.phone_cc,
        r.phone,
        r.reason,
        r.message,
        r.user_agent,
      ]
        .map(csvField)
        .join(","),
    );
  }
  // Prepend a BOM so Excel opens UTF-8 (₹, em-dashes) correctly.
  const csv = "﻿" + lines.join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contact-submissions-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
