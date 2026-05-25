"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getVertical } from "@/lib/verticals";

// Capture launch interest for a "coming soon" vertical. Anon inserts into
// contact_submissions are blocked by RLS, so we use the service-role client
// (server-only). Phone goes into `message` since the table has no phone column.
// Read/export these from the admin: /admin/contact (and its CSV download).
export async function submitVerticalInterest(input: {
  vertical: string;
  email: string;
  phone: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const v = getVertical(input.vertical);
  if (!v || v.status !== "soon") {
    return { ok: false, error: "unknown_vertical" };
  }

  const email = (input.email ?? "").trim();
  const phone = (input.phone ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (phone.replace(/\D/g, "").length < 8) {
    return { ok: false, error: "Enter a valid phone number." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("contact_submissions").insert({
    name: null,
    email,
    reason: `interest:${v.slug}`,
    message: `Phone: ${phone} — wants Better for You ${v.label} launch updates`,
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
