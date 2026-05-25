import { createAdminClient } from "@/lib/supabase/admin";

// Shared data + CSV builder for contact_submissions, used by the export link
// and the browser view. Supabase is the source of truth. `select *` so it
// tolerates the phone_cc/phone columns whether or not the migration has run.
export type ContactRow = {
  created_at?: string | null;
  name?: string | null;
  email?: string | null;
  phone_cc?: string | null;
  phone?: string | null;
  reason?: string | null;
  message?: string | null;
  user_agent?: string | null;
};

export async function fetchContactRows(): Promise<
  { rows: ContactRow[] } | { error: string }
> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return { error: error.message };
  return { rows: (data ?? []) as ContactRow[] };
}

export function contactNumber(r: ContactRow): string {
  return [r.phone_cc, r.phone].filter(Boolean).join(" ");
}

export function contactDate(r: ContactRow): string {
  return r.created_at
    ? new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")
    : "";
}

// RFC-4180 field escaping: wrap in quotes, double any inner quotes.
function csvField(value: unknown): string {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function buildContactCsv(): Promise<
  { csv: string } | { error: string }
> {
  const result = await fetchContactRows();
  if ("error" in result) return { error: result.error };

  const header = ["Date", "Name", "Email", "Number", "Reason", "Notes"];
  const lines = [header.map(csvField).join(",")];
  for (const r of result.rows) {
    lines.push(
      [contactDate(r), r.name, r.email, contactNumber(r), r.reason, r.message]
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
