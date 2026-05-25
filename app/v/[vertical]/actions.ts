"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getVertical } from "@/lib/verticals";

// Best-effort mirror of a signup into the Google Sheet (Apps Script web app).
// The DB insert is the reliable record; if the Sheet write fails or the env
// vars aren't set yet, we just skip it — the signup still succeeds.
async function mirrorToSheet(payload: {
  vertical: string;
  label: string;
  email: string;
  phone: string;
}): Promise<void> {
  const url = process.env.LAUNCH_INTEREST_WEBHOOK_URL;
  const token = process.env.LAUNCH_INTEREST_WEBHOOK_TOKEN;
  if (!url || !token) return; // not configured yet — DB write is the source of truth

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 5000);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        vertical: payload.vertical,
        email: payload.email,
        phone: payload.phone,
        source: `Better for You ${payload.label} coming-soon page`,
      }),
      signal: ctl.signal,
    });
  } catch {
    // Swallow — the DB row already captured this signup.
  } finally {
    clearTimeout(timer);
  }
}

// Capture launch interest for a "coming soon" vertical. Anon inserts into
// contact_submissions are blocked by RLS, so we use the service-role client
// (server-only). Phone goes into `message` since the table has no phone column.
// We also mirror the signup into a Google Sheet (best-effort) for easy viewing.
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

  // Mirror to the Google Sheet after the DB row is safely written.
  await mirrorToSheet({ vertical: v.slug, label: v.label, email, phone });

  return { ok: true };
}
