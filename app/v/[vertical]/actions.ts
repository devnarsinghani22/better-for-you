"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getVertical } from "@/lib/verticals";

// Capture launch interest for a "coming soon" vertical. Anon inserts into
// contact_submissions are blocked by RLS, so we use the service-role client.
// Phone is stored in dedicated phone_cc / phone columns for clean exports; if
// those columns don't exist yet (pre-migration), we fall back to stashing the
// phone in `message` so a signup never fails. Read/export from /admin/contact.
export async function submitVerticalInterest(input: {
  vertical: string;
  email: string;
  phoneCc?: string;
  phone: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const v = getVertical(input.vertical);
  if (!v || v.status !== "soon") {
    return { ok: false, error: "unknown_vertical" };
  }

  const email = (input.email ?? "").trim();
  const phone = (input.phone ?? "").trim();
  const phoneCc = ((input.phoneCc ?? "").trim() || "+91").replace(/[^\d+]/g, "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (phone.replace(/\D/g, "").length < 8) {
    return { ok: false, error: "Please enter a valid phone number." };
  }

  const admin = createAdminClient();
  const reason = `interest:${v.slug}`;
  const message = `Phone: ${phoneCc} ${phone} — wants Better for You ${v.label} launch updates`;

  // Preferred: structured columns.
  let { error } = await admin.from("contact_submissions").insert({
    name: null,
    email,
    phone_cc: phoneCc,
    phone,
    reason,
    message,
  });

  // Fallback if phone_cc/phone columns aren't migrated yet (column-not-found).
  if (
    error &&
    /could not find|schema cache|column|PGRST204|42703/i.test(
      `${error.message} ${error.code ?? ""}`,
    )
  ) {
    ({ error } = await admin
      .from("contact_submissions")
      .insert({ name: null, email, reason, message }));
  }

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
