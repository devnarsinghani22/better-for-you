"""
strip_bg_crop.py — Pre-crop the source image to a front-face-only region
before running rembg. For products where the Amazon hero is a 3D box
render showing multiple faces (and rembg can't separate them).

Edit JOBS below or pass as CLI: <slug> <source_url> <left> <top> <right> <bottom>
where each box value is a 0..1 fraction of the source image dimensions.
"""

import sys
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    for line in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()
    return env


ENV = load_env()
SUPABASE_URL = ENV["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SERVICE_KEY = ENV["SUPABASE_SERVICE_ROLE_KEY"]
BUCKET = "products"
HEADERS = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}


# (slug, source_url, left, top, right, bottom) — box as fractions of source.
JOBS: list[tuple] = [
    (
        "jiwa-instant-oats-noodles",
        "https://m.media-amazon.com/images/I/81E+Xr7i8kL._SL1500_.jpg",
        0.00, 0.00, 1.00, 1.00,
    ),
    (
        "amul-malai-paneer",
        "https://m.media-amazon.com/images/I/81XmZiUfm5L._SL1500_.jpg",
        0.00, 0.00, 0.62, 1.00,
    ),
]


def upload_png(slug: str, png_bytes: bytes) -> str:
    object_path = f"{slug}-nobg.png"
    r = requests.post(
        f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{object_path}",
        headers={**HEADERS, "Content-Type": "image/png", "x-upsert": "true"},
        data=png_bytes,
        timeout=120,
    )
    if r.status_code not in (200, 201):
        raise RuntimeError(f"upload {r.status_code}: {r.text}")
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{object_path}"


def update_url(slug: str, new_url: str) -> None:
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/products",
        headers={**HEADERS, "Content-Type": "application/json", "Prefer": "return=minimal"},
        params={"slug": f"eq.{slug}"},
        json={"product_photo_url": new_url},
        timeout=30,
    )
    if not r.ok:
        raise RuntimeError(f"db patch {r.status_code}: {r.text}")


def process(job: tuple, session) -> None:
    slug, src_url, l, t, r, b = job
    print(f"\n[{slug}] downloading {src_url}")
    raw = requests.get(src_url, timeout=60, headers={"User-Agent": "Mozilla/5.0 Chrome/125.0"})
    raw.raise_for_status()
    img = Image.open(BytesIO(raw.content)).convert("RGBA")
    W, H = img.size
    box = (int(l * W), int(t * H), int(r * W), int(b * H))
    print(f"[{slug}] orig {W}x{H} -> crop {box} = {box[2]-box[0]}x{box[3]-box[1]}")
    cropped = img.crop(box)

    print(f"[{slug}] rembg (basic, no alpha matting) …")
    out = remove(cropped, session=session)

    buf = BytesIO()
    out.save(buf, format="PNG", optimize=True)
    new_url = upload_png(slug, buf.getvalue())
    update_url(slug, new_url)
    print(f"[{slug}] -> {new_url}")


def main() -> int:
    jobs = JOBS
    if len(sys.argv) >= 7:
        slug, src, l, t, r, b = sys.argv[1:7]
        jobs = [(slug, src, float(l), float(t), float(r), float(b))]

    model = "u2net"
    print(f"Loading rembg session: {model}")
    session = new_session(model)
    for j in jobs:
        try:
            process(j, session)
        except Exception as e:
            print(f"[{j[0]}] FAILED: {e}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
