"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getVertical } from "@/lib/verticals";

// Capture launch interest for a "coming soon" vertical. Anon inserts into
// contact_submissions are blocked by RLS, so we use the service-role client.
// Name/email/phone go in their own columns for clean exports; if the phone
// column doesn't exist yet (pre-migration) we fall back to stashing the phone
// in `message` so a signup never fails. Read/export from /admin/contact.
export async function submitVerticalInterest(input: {
  vertical: string;
  name: string;
  email: string;
  phone: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const v = getVertical(input.vertical);
  if (!v || v.status !== "soon") {
    return { ok: false, error: "unknown_vertical" };
  }

  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const phone = (input.phone ?? "").trim();
  if (name.length < 1) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (phone.replace(/\D/g, "").length < 8) {
    return { ok: false, error: "Please enter a valid phone number." };
  }

  const admin = createAdminClient();
  const reason = `interest:${v.slug}`;

  // Preferred: structured columns, clean message.
  let { error } = await admin.from("contact_submissions").insert({
    name,
    email,
    phone,
    reason,
    message: `Wants Better for You ${v.label} launch updates`,
  });

  // Fallback if the phone column isn't migrated yet (column-not-found): keep
  // the phone inside message so nothing is lost.
  if (
    error &&
    /could not find|schema cache|column|PGRST204|42703/i.test(
      `${error.message} ${error.code ?? ""}`,
    )
  ) {
    ({ error } = await admin.from("contact_submissions").insert({
      name,
      email,
      reason,
      message: `Phone: ${phone} — wants Better for You ${v.label} launch updates`,
    }));
  }

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
