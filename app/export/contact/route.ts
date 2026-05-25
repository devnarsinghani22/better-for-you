import { buildContactCsv, csvResponse } from "@/lib/contact-export";

// Login-free CSV download, gated by a secret token instead of auth — avoids the
// Supabase magic-link email rate limit. Bookmark:
//   /export/contact?key=<CONTACT_EXPORT_TOKEN>
// Outside /admin on purpose, so the auth middleware doesn't redirect it.
// Anyone with the link + token can download, so keep the token private.
export const dynamic = "force-dynamic";

// Constant-time-ish compare to avoid leaking the token via timing.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function GET(request: Request) {
  const token = process.env.CONTACT_EXPORT_TOKEN;
  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!token || !safeEqual(key, token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await buildContactCsv();
  if ("error" in result) {
    return new Response(`Could not export: ${result.error}`, { status: 500 });
  }
  return csvResponse(result.csv);
}
