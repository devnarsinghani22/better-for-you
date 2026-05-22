import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Better for You by Food Pharmer — packaged foods we'd actually buy.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#FFFFFF",
          color: "#000000",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "monospace",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#666666",
          }}
        >
          <span>Better for You · by Food Pharmer</span>
          <span>foodpharmer.health</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 132,
              lineHeight: 0.94,
              color: "#000000",
              fontWeight: 500,
              letterSpacing: -4,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Better for You</span>
            <span style={{ fontStyle: "italic", fontWeight: 400 }}>
              by Food Pharmer
            </span>
          </div>
          <div
            style={{
              fontStyle: "italic",
              fontSize: 36,
              color: "#000000",
              marginTop: 8,
            }}
          >
            Label Padhega India.
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.4,
              color: "#444444",
              maxWidth: 900,
            }}
          >
            We read ingredient lists and nutrition labels to shortlist products
            that are better for you. Not sponsored.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "monospace",
            fontSize: 16,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#666666",
          }}
        >
          <span>Reviewed by Food Pharmer + nutrition experts</span>
          <span style={{ color: "#000000" }}>foodpharmer.health →</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
