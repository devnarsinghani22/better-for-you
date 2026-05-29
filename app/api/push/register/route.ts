import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Stores an FCM/APNs device token from the native app. Service-role only —
// push_tokens has RLS on with no anon policies, so tokens are never readable
// by the client. Upsert on token so re-registration just refreshes last_seen.
export async function POST(req: Request) {
  let body: { token?: string; platform?: string; appVersion?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  if (token.length < 20 || token.length > 4096) {
    return NextResponse.json({ ok: false, error: "bad token" }, { status: 400 });
  }
  const platform =
    body.platform === "ios" || body.platform === "android"
      ? body.platform
      : null;

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { error } = await sb.from("push_tokens").upsert(
    {
      token,
      platform,
      app_version: (body.appVersion ?? "").slice(0, 40) || null,
      enabled: true,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "token" },
  );

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
