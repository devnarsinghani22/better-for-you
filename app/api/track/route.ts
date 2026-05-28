import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Lightweight beacon endpoint for outbound buy-button clicks and
// (in future) other ad-hoc client events. Designed for
// navigator.sendBeacon(), so the response shape is intentionally trivial.
//
// Body: { type: 'outbound' | 'search_miss', slug?, query?, target?, result_count? }
//
// Failed-search events are inserted from inside /api/search itself; this
// endpoint primarily handles the user-driven 'outbound' beacons fired by
// <BuyLink>.

const ALLOWED_TYPES = new Set(["outbound", "search_miss"]);

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // sendBeacon may send text/plain — accept that too.
    try {
      body = JSON.parse(await req.text());
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
  }

  const type = String(body.type ?? "");
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.slice(0, 200) : null;
  const query =
    typeof body.query === "string" ? body.query.slice(0, 200) : null;
  const target =
    typeof body.target === "string" ? body.target.slice(0, 500) : null;
  const result_count =
    typeof body.result_count === "number" ? body.result_count : null;

  const user_agent = req.headers.get("user-agent")?.slice(0, 240) ?? null;
  const referer = req.headers.get("referer")?.slice(0, 500) ?? null;

  const sb = await createClient();
  const { error } = await sb.from("click_events").insert({
    type,
    slug,
    query,
    target,
    result_count,
    user_agent,
    referer,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
