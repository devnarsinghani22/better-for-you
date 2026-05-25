import { createAdminClient } from "@/lib/supabase/admin";

// Shared CSV builder for contact_submissions, used by both the admin export
// route and the token-protected /export/contact link. Supabase is the source
// of truth. `select *` so it tolerates the phone_cc/phone columns whether or
// not the migration has run.
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

export async function buildContactCsv(): Promise<
  { csv: string } | { error: string }
> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

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
  for (const r of (data ?? []) as unknown as Row[]) {
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
  return { csv: "﻿" + lines.join("\r\n") };
}

export function csvResponse(csv: string): Response {
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contact-submissions-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
