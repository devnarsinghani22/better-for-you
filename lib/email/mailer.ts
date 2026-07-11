import "server-only";
import nodemailer from "nodemailer";
import { createAdminClient } from "@/lib/supabase/admin";

// Transactional email over the existing Hostinger mailbox. Creds live in
// .env.local (SMTP_*). Port 465 = implicit TLS (secure:true). We send *from*
// hello@foodpharmer.net — that's the authenticated SMTP_USER, so it passes
// SPF/DKIM cleanly rather than getting spam-foldered.
const FROM_ADDRESS = "hello@foodpharmer.net";
const FROM_NAME = process.env.SMTP_FROM_NAME || "Food Pharmer";

// Where the Oil Board PDF lives in Supabase Storage (PRIVATE bucket — the file
// is never exposed as a public URL; we download it server-side and attach it).
// Bucket/object keep the plural "oil-boards" key: internal names, not visible.
export const OIL_BOARDS_BUCKET = "oil-boards";
export const OIL_BOARDS_OBJECT = "oil-boards.pdf";
export const OIL_BOARDS_FILENAME = "Food-Pharmer-Oil-Board.pdf";

let cached: nodemailer.Transporter | null = null;

function transport() {
  if (cached) return cached;
  const port = Number(process.env.SMTP_PORT || 465);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // implicit TLS on 465, STARTTLS otherwise
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return cached;
}

// Pull the PDF out of the private storage bucket as a Buffer for attaching.
// Returns null if the file isn't uploaded yet (feature is wired before the PDF
// is dropped in) so callers can fail gracefully instead of 500-ing.
async function loadOilBoardsPdf(): Promise<Buffer | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(OIL_BOARDS_BUCKET)
    .download(OIL_BOARDS_OBJECT);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

// Emails the Oil Board PDF as an attachment. Throws on a genuine send failure
// so the server action can report it; returns { skipped } if the PDF isn't
// uploaded yet.
export async function sendOilBoardsEmail(to: string): Promise<{ ok: true } | { ok: false; reason: "no_pdf" }> {
  const pdf = await loadOilBoardsPdf();
  if (!pdf) return { ok: false, reason: "no_pdf" };

  await transport().sendMail({
    from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
    to,
    subject: "Your Oil Board from Food Pharmer",
    text: [
      "Hi,",
      "",
      "Thanks for requesting the Oil Board. The PDF is attached to this email.",
      "",
      "Love,",
      "Food Pharmer",
    ].join("\n"),
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:520px;margin:0 auto">
        <p>Hi,</p>
        <p>Thanks for requesting the <strong>Oil Board</strong>. The PDF is attached to this email.</p>
        <p style="margin-top:28px">
          Love,<br>
          Food Pharmer
        </p>
      </div>`,
    attachments: [
      { filename: OIL_BOARDS_FILENAME, content: pdf, contentType: "application/pdf" },
    ],
  });

  return { ok: true };
}
