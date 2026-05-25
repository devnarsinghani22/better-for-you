import { buildContactCsv, csvResponse } from "@/lib/contact-export";

// CSV export of the whole contact inbox. Lives under /admin, so the middleware
// auth gate protects it. For a login-free download, see /export/contact.
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await buildContactCsv();
  if ("error" in result) {
    return new Response(`Could not export: ${result.error}`, { status: 500 });
  }
  return csvResponse(result.csv);
}
