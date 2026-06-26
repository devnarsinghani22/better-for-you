import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Better for You by Food Pharmer — packaged foods we'd actually buy.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Older UA forces Google Fonts to return a satori-compatible format. Google now
// serves .woff (not .ttf) to this UA; satori supports ttf/otf/woff — but NOT
// woff2 — so match any of those (the woff2 URL ends in `.woff2)` and is skipped).
const FONT_UA =
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0 Safari/537.36";

async function loadGoogleFont(cssUrl: string): Promise<ArrayBuffer> {
  const css = await fetch(cssUrl, { headers: { "User-Agent": FONT_UA } }).then(
    (r) => r.text()
  );
  const match = css.match(/url\((https:[^)]+\.(?:ttf|otf|woff))\)/);
  if (!match) throw new Error("Font URL not found in CSS");
  const buf = await fetch(match[1]).then((r) => r.arrayBuffer());
  return buf;
}

export default async function OGImage() {
  const [playfairMedium, playfairItalic] = await Promise.all([
    loadGoogleFont(
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&display=swap"
    ),
    loadGoogleFont(
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&display=swap"
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          backgroundColor: "#FFFFFF",
          color: "#000000",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#555555",
          }}
        >
          <span>Better for You · by Food Pharmer</span>
          <span>foodpharmer.health</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: -10,
          }}
        >
          <div
            style={{
              fontFamily: "Playfair",
              fontSize: 148,
              fontWeight: 500,
              lineHeight: 1.0,
              letterSpacing: -4,
              color: "#000000",
            }}
          >
            Better for You
          </div>
          <div
            style={{
              fontFamily: "Playfair Italic",
              fontStyle: "italic",
              fontSize: 132,
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: -3,
              color: "#000000",
            }}
          >
            by Food Pharmer
          </div>
          <div
            style={{
              fontFamily: "Playfair Italic",
              fontStyle: "italic",
              fontSize: 38,
              color: "#000000",
              marginTop: 22,
            }}
          >
            Label Padhega India.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            fontSize: 18,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#555555",
          }}
        >
          <span style={{ color: "#000000" }}>foodpharmer.health →</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Playfair",
          data: playfairMedium,
          style: "normal",
          weight: 500,
        },
        {
          name: "Playfair Italic",
          data: playfairItalic,
          style: "italic",
          weight: 400,
        },
      ],
    }
  );
}
