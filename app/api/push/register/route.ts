import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Stores an FCM/APNs device token from the native app. Service-role only —
// push_tokens has RLS on with no anon policies, so tokens are never readable
// by the client. Upsert on token so re-registration just refreshes last_seen.
export async function POST(req: Request) {
  // TEMP DEBUG (iOS push): log the exact payload the native app sends, so we
  // can see whether iOS posts a token at all and what shape it is.
  const raw = await req.text();
  console.log("[push/register] raw body:", raw);

  let body: { token?: string; platform?: string; appVersion?: string };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  console.log(
    "[push/register] platform=", body.platform,
    "tokenLen=", token.length,
    "tokenStart=", token.slice(0, 30),
  );
  if (token.length < 20 || token.length > 4096) {
    console.log("[push/register] REJECTED: bad token length", token.length);
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
    console.log("[push/register] insert error:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  console.log("[push/register] STORED platform=", platform, "tokenLen=", token.length);
  return NextResponse.json({ ok: true });
}
