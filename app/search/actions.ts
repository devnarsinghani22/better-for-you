"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// Capture a zero-result search as a product request. Anon inserts into
// contact_submissions are blocked by RLS, so we use the service-role client
// (same pattern as submitVerticalInterest). Email is optional — a request with
// no email still counts as demand. Surfaces in the weekly analytics digest
// under reason "product_request" and exports from /admin/contact.
export async function requestProduct(
  query: string,
  email?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const q = (query ?? "").trim().slice(0, 200);
  if (q.length < 2) {
    return { ok: false, error: "Nothing to request." };
  }
  const e = (email ?? "").trim();
  if (e && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
    return { ok: false, error: "Please enter a valid email, or leave it blank." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("contact_submissions").insert({
    reason: "product_request",
    message: `Searched for "${q}" — not on the list yet`,
    email: e || null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
