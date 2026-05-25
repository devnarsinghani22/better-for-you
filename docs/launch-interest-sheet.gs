/**
 * Launch-interest collector for "Better for You" coming-soon verticals.
 *
 * It receives a POST from the website (the /v/<vertical> "Notify me" form)
 * and appends one row to THIS spreadsheet. The website also keeps writing to
 * Supabase, so the Sheet is a convenient human-readable copy, not the only one.
 *
 * The bound spreadsheet:
 *   https://docs.google.com/spreadsheets/d/1evrwGP285RRbxw7Ex5iEt1tUxuuguA9SK9nGPVWZzbE
 *   Header row (row 1): Timestamp | Vertical | Email | Phone | Source
 *
 * ──────────────────────────────────────────────────────────────────────────
 * HOW TO DEPLOY (one-time, ~2 minutes):
 *   1. Open the spreadsheet above.
 *   2. Extensions → Apps Script. Delete the default code, paste this whole file.
 *   3. Set SHARED_SECRET below to a long random string (keep it private).
 *      Send me the SAME string — it goes in the site's env as
 *      LAUNCH_INTEREST_WEBHOOK_TOKEN so only our server can write.
 *   4. Deploy → New deployment → gear icon → "Web app".
 *        - Description : launch-interest collector
 *        - Execute as  : Me
 *        - Who has access : Anyone
 *      Click Deploy → Authorize/Allow when prompted.
 *   5. Copy the "Web app URL" (ends in /exec). Send it to me — it becomes
 *      LAUNCH_INTEREST_WEBHOOK_URL in the site's env.
 *
 * To test without the site: Run → testAppend (writes one fake row).
 * If you ever change this code, you must Deploy → "Manage deployments" →
 * edit the existing deployment → "New version" for the URL to pick it up.
 * ──────────────────────────────────────────────────────────────────────────
 */

// Replace with a long random string, then give me the same value.
const SHARED_SECRET = "PASTE_A_LONG_RANDOM_SECRET_HERE";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: "no_body" });
    }
    const body = JSON.parse(e.postData.contents);

    if (String(body.token || "") !== SHARED_SECRET) {
      return json_({ ok: false, error: "unauthorized" });
    }

    const vertical = String(body.vertical || "").slice(0, 64);
    const email = String(body.email || "").slice(0, 320);
    const phone = String(body.phone || "").slice(0, 32);
    const source = String(body.source || "").slice(0, 256);

    if (!email && !phone) {
      return json_({ ok: false, error: "empty" });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    sheet.appendRow([new Date(), vertical, email, phone, source]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Lightweight health check — opening the URL in a browser shows this.
function doGet() {
  return json_({ ok: true, service: "launch-interest collector" });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// Run this manually once to confirm rows land in the sheet.
function testAppend() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.appendRow([new Date(), "restaurants", "test@example.com", "+919999999999", "manual test"]);
}
