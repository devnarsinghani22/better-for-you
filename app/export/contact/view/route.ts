import {
  fetchContactRows,
  contactNumber,
  contactDate,
  type ContactRow,
} from "@/lib/contact-export";

// Login-free browser view of the responses (count + table), gated by the same
// secret token as the CSV download. Open:
//   /export/contact/view?key=<CONTACT_EXPORT_TOKEN>
// Outside /admin so the auth middleware doesn't redirect it. Keep the link private.
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function esc(value: unknown): string {
  const s = value == null ? "" : String(value);
  return s.replace(/[&<>"']/g, (c) =>
    c === "&"
      ? "&amp;"
      : c === "<"
        ? "&lt;"
        : c === ">"
          ? "&gt;"
          : c === '"'
            ? "&quot;"
            : "&#39;",
  );
}

export async function GET(request: Request) {
  const token = process.env.CONTACT_EXPORT_TOKEN;
  const url = new URL(request.url);
  const key = url.searchParams.get("key") ?? "";
  if (!token || !safeEqual(key, token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await fetchContactRows();
  if ("error" in result) {
    return new Response(`Could not load: ${result.error}`, { status: 500 });
  }

  const rows = result.rows;
  const signups = rows.filter((r) => (r.reason ?? "").startsWith("interest:"));
  const csvHref = `/export/contact?key=${encodeURIComponent(key)}`;

  const tableRows = rows
    .map((r: ContactRow) => {
      const number = contactNumber(r);
      const wa = number.replace(/\D/g, "");
      return `<tr>
        <td class="mono">${esc(contactDate(r))}</td>
        <td>${esc(r.name) || "<span class='muted'>—</span>"}</td>
        <td>${r.email ? `<a href="mailto:${esc(r.email)}">${esc(r.email)}</a>` : "<span class='muted'>—</span>"}</td>
        <td>${number ? `<a href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">${esc(number)}</a>` : "<span class='muted'>—</span>"}</td>
        <td class="mono">${esc(r.reason) || ""}</td>
        <td>${esc(r.message) || ""}</td>
      </tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>Responses — Better for You</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; color: #111;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 28px 20px 60px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .counts { display: flex; gap: 28px; margin: 18px 0 8px; flex-wrap: wrap; }
  .stat .n { font-size: 40px; font-weight: 700; line-height: 1; }
  .stat .l { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: #777; margin-top: 6px; }
  .bar { display:flex; gap:16px; align-items:center; margin: 14px 0 22px; flex-wrap: wrap; }
  a.btn { display:inline-block; background:#111; color:#fff; text-decoration:none;
    padding:9px 16px; font-size:12px; text-transform:uppercase; letter-spacing:.12em; border-radius:3px; }
  .hint { font-size: 12px; color:#888; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color:#666; border-bottom: 2px solid #111; position: sticky; top: 0; background:#fff; }
  tr:hover td { background: #fafafa; }
  td.mono, th.mono { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .muted { color: #bbb; }
  a { color: #111; }
</style></head>
<body><div class="wrap">
  <h1>Better for You — responses</h1>
  <div class="counts">
    <div class="stat"><div class="n">${rows.length}</div><div class="l">Total entries</div></div>
    <div class="stat"><div class="n">${signups.length}</div><div class="l">Notify-me signups</div></div>
  </div>
  <div class="bar">
    <a class="btn" href="${csvHref}">↓ Download CSV</a>
    <span class="hint">Live from the database · reload to refresh</span>
  </div>
  <table>
    <thead><tr><th class="mono">Date</th><th>Name</th><th>Email</th><th>Number</th><th class="mono">Reason</th><th>Notes</th></tr></thead>
    <tbody>${tableRows || `<tr><td colspan="6" class="muted">No responses yet.</td></tr>`}</tbody>
  </table>
</div></body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
