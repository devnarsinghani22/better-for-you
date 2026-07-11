"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendOilBoardsEmail } from "@/lib/email/mailer";

// Oil Boards lead magnet: capture an email, save it to contact_submissions
// (reason "oil_boards", read/export from /admin/contact), then EMAIL the PDF as
// an attachment. No download link is ever shown on the site — delivery is by
// email only. Anon inserts are blocked by RLS, so we use the service-role
// client, matching submitVerticalInterest().
//
// Abuse controls (this is a public endpoint that sends mail to any address):
// - honeypot field: bots that fill the hidden input get a fake success.
// - per-email cap: max 2 sends per address per 24h (stops mailbombing a
//   third-party inbox with our PDF).
// - global daily cap: stop sending (still capture the lead) past 200/day so a
//   flood can't exhaust the shared hello@foodpharmer.net Hostinger quota.
const PER_EMAIL_CAP_24H = 2;
const GLOBAL_DAILY_SEND_CAP = 200;
const FRIENDLY_RETRY = "Something went wrong. Please try again.";
const ON_LIST = "You're on the list. We'll email your Oil Boards shortly.";

export async function requestOilBoards(input: {
  email: string;
  website?: string; // honeypot — humans never see or fill this
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = (input.email ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  // Honeypot tripped: pretend success, do nothing.
  if ((input.website ?? "").trim() !== "") return { ok: true };

  try {
    const admin = createAdminClient();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Per-email cap: if this address already got its sends, confirm without
    // re-sending (their copy is already in the inbox).
    const { count: emailCount, error: emailCountErr } = await admin
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("reason", "oil_boards")
      .eq("email", email)
      .gte("created_at", dayAgo);
    if (emailCountErr) {
      console.error("[oil-boards] rate-check failed:", emailCountErr.message);
      return { ok: false, error: FRIENDLY_RETRY };
    }
    if ((emailCount ?? 0) >= PER_EMAIL_CAP_24H) return { ok: true };

    // Global daily cap: past it we still record the lead but skip the send.
    const { count: dayCount } = await admin
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("reason", "oil_boards")
      .gte("created_at", dayAgo);
    const overGlobalCap = (dayCount ?? 0) >= GLOBAL_DAILY_SEND_CAP;

    // Save the lead first so we never lose it, even if the email send hiccups.
    const { error } = await admin.from("contact_submissions").insert({
      email,
      reason: "oil_boards",
      message: "Requested the Oil Boards PDF",
    });
    if (error) {
      console.error("[oil-boards] lead insert failed:", error.message);
      return { ok: false, error: FRIENDLY_RETRY };
    }

    if (overGlobalCap) {
      console.error(
        `[oil-boards] global daily send cap (${GLOBAL_DAILY_SEND_CAP}) hit; lead saved, send skipped for ${email}`,
      );
      return { ok: false, error: ON_LIST };
    }

    // Send the PDF. If the file isn't uploaded yet, the lead is still captured;
    // tell the user we'll send it shortly rather than pretending it arrived.
    const sent = await sendOilBoardsEmail(email);
    if (!sent.ok) {
      console.error(
        "[oil-boards] PDF not in storage (oil-boards/oil-boards.pdf); lead saved, send skipped",
      );
      return { ok: false, error: ON_LIST };
    }
  } catch (e) {
    console.error("[oil-boards] send failed:", e);
    return { ok: false, error: ON_LIST };
  }

  return { ok: true };
}
