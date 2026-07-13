import { ImageResponse } from "next/og";
import sharp from "sharp";

export const alt = "Better for You by Food Pharmer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Cost guard: this route must stay statically cacheable. No cookies() /
// request-time APIs (the cookie-based Supabase client would force a fresh
// render + photo download on EVERY crawler hit). Data comes from a plain
// cached REST fetch instead, and the rendered PNG is revalidated daily.
export const revalidate = 86400;

// The metadata route ships Cache-Control: max-age=0 by default (and
// next.config headers() cannot override a handler-set Cache-Control), so the
// edge cache directive goes on the ImageResponse itself. satori+sharp per
// render is the expensive part; a day of edge caching makes it ~1 render per
// product per region per day.
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
};

// Older UA forces Google Fonts to return a satori-compatible format (see
// app/opengraph-image.tsx for the full story).
const FONT_UA =
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0 Safari/537.36";

async function loadGoogleFont(cssUrl: string): Promise<ArrayBuffer> {
  const css = await fetch(cssUrl, { headers: { "User-Agent": FONT_UA } }).then(
    (r) => r.text()
  );
  const match = css.match(/url\((https:[^)]+\.(?:ttf|otf|woff))\)/);
  if (!match) throw new Error("Font URL not found in CSS");
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

const SITE_URL = "https://foodpharmer.health";

// Minimal cached lookup for the card: name, photo, brand. Plain anon REST
// fetch (no cookies) so the route stays static; 24h data cache.
async function fetchProductForCard(categorySlug: string, productSlug: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return null;
  try {
    const qs =
      `select=name,product_photo_url,brand:brands(name),category:categories!inner(slug)` +
      `&slug=eq.${encodeURIComponent(productSlug)}` +
      `&category.slug=eq.${encodeURIComponent(categorySlug)}` +
      `&status=eq.Live&limit=1`;
    const res = await fetch(`${base}/rest/v1/products?${qs}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as {
      name: string;
      product_photo_url: string | null;
      brand: { name: string } | { name: string }[] | null;
    }[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// Product photos are stored as webp, which satori cannot decode — convert to
// png and inline as a data URI. Relative /storage paths are fetched via the
// prod domain so Cloudflare's cache rule absorbs the hit instead of Supabase
// egress. Any failure returns null and the card renders without a photo.
async function loadPhotoAsPngDataUri(photoUrl: string): Promise<string | null> {
  try {
    const abs = photoUrl.startsWith("http")
      ? photoUrl
      : `${SITE_URL}${photoUrl}`;
    const res = await fetch(abs, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const png = await sharp(buf)
      .resize(560, 560, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;

  const [playfairMedium, playfairItalic, product] = await Promise.all([
    loadGoogleFont(
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&display=swap"
    ),
    loadGoogleFont(
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&display=swap"
    ),
    fetchProductForCard(category, slug),
  ]);

  const fonts = [
    { name: "Playfair", data: playfairMedium, style: "normal" as const, weight: 500 as const },
    { name: "Playfair Italic", data: playfairItalic, style: "italic" as const, weight: 400 as const },
  ];

  const brand = product
    ? (Array.isArray(product.brand) ? product.brand[0] : product.brand)
    : null;

  const photo = product?.product_photo_url
    ? await loadPhotoAsPngDataUri(product.product_photo_url)
    : null;

  // Fallback: unknown product renders the site-wide card so the link still
  // previews on-brand.
  if (!product) {
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
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: "Playfair", fontSize: 148, fontWeight: 500, lineHeight: 1.0, letterSpacing: -4 }}>
              Better for You
            </div>
            <div style={{ fontFamily: "Playfair Italic", fontStyle: "italic", fontSize: 132, lineHeight: 1.0, letterSpacing: -3 }}>
              by Food Pharmer
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 18, letterSpacing: 3, textTransform: "uppercase" }}>
            <span>foodpharmer.health →</span>
          </div>
        </div>
      ),
      { ...size, fonts, headers: CACHE_HEADERS }
    );
  }

  const brandName = brand?.name ?? "";
  const nameSize =
    product.name.length > 34 ? 56 : product.name.length > 22 ? 68 : 82;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 72px",
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
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
            flex: 1,
            marginTop: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              maxWidth: photo ? 620 : 1000,
            }}
          >
            {brandName ? (
              <div
                style={{
                  fontFamily: "Playfair Italic",
                  fontStyle: "italic",
                  fontSize: 40,
                  color: "#333333",
                }}
              >
                {brandName}
              </div>
            ) : null}
            <div
              style={{
                fontFamily: "Playfair",
                fontSize: nameSize,
                fontWeight: 500,
                lineHeight: 1.05,
                letterSpacing: -1,
              }}
            >
              {product.name}
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 17,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#555555",
              }}
            >
              On the Better for You list
            </div>
          </div>

          {photo ? (
            <img
              src={photo}
              width={430}
              height={430}
              style={{ objectFit: "contain" }}
            />
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            fontSize: 18,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          <span>foodpharmer.health →</span>
        </div>
      </div>
    ),
    { ...size, fonts, headers: CACHE_HEADERS }
  );
}
