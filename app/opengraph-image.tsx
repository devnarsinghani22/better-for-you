import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Food Pharmer Approved — packaged foods we'd actually buy.";
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
          padding: "70px 80px",
          backgroundColor: "#F5F1E6",
          backgroundImage:
            "radial-gradient(circle at 100% 0%, #E8E0CC 0%, transparent 60%)",
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
            color: "#5C5145",
          }}
        >
          <span>Food Pharmer · Approved</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 110,
              lineHeight: 0.92,
              color: "#1A1612",
              fontWeight: 500,
              letterSpacing: -3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Packaged food</span>
            <span>
              we&rsquo;d{" "}
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                actually
              </span>{" "}
              buy.
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "#5C5145",
              maxWidth: 840,
            }}
          >
            We read the ingredients so you don&rsquo;t have to. Every product
            links back to the source.
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
            color: "#5C5145",
          }}
        >
          <span>Label Padhega India.</span>
          <span style={{ color: "#1A1612" }}>foodpharmer-approved.vercel.app →</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
