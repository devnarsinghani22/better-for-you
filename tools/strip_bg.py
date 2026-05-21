"""
strip_bg.py — One-shot background removal for every Live product photo.

For each Live product:
  1. Download the source image at product_photo_url
  2. Run rembg (u2net) to produce a transparent-bg PNG
  3. Upload to Supabase Storage at products/{slug}-nobg.png
  4. UPDATE products.product_photo_url to point at the new file

Idempotent: re-runs skip products whose URL already ends in "-nobg.png".
"""

import sys
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]


def load_env() -> dict[str, str]:
    env_path = ROOT / ".env.local"
    env: dict[str, str] = {}
    for line in env_path.read_text(encoding="utf-8").splitlines():
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

REST_HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
}


def fetch_live_products() -> list[dict]:
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/products",
        headers=REST_HEADERS,
        params={
            "select": "id,slug,product_photo_url",
            "status": "eq.Live",
            "product_photo_url": "not.is.null",
            "order": "id.asc",
        },
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def upload_png(slug: str, png_bytes: bytes) -> str:
    object_path = f"{slug}-nobg.png"
    r = requests.post(
        f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{object_path}",
        headers={
            **REST_HEADERS,
            "Content-Type": "image/png",
            "x-upsert": "true",
        },
        data=png_bytes,
        timeout=60,
    )
    if r.status_code not in (200, 201):
        raise RuntimeError(f"upload failed {r.status_code}: {r.text}")
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{object_path}"


def update_product_url(product_id: int, new_url: str) -> None:
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/products",
        headers={
            **REST_HEADERS,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        params={"id": f"eq.{product_id}"},
        json={"product_photo_url": new_url},
        timeout=30,
    )
    if not r.ok:
        raise RuntimeError(f"db update failed {r.status_code}: {r.text}")


def process(product: dict, session) -> str:
    pid = product["id"]
    slug = product["slug"]
    src_url = product["product_photo_url"]

    if "-nobg.png" in src_url:
        print(f"  [skip] {slug} (already processed)")
        return "skipped"

    # Download
    try:
        r = requests.get(
            src_url,
            timeout=30,
            headers={"User-Agent": "FoodPharmer-Approved/1.0"},
        )
        r.raise_for_status()
    except Exception as e:
        print(f"  [fail-dl] {slug}: {e}")
        return "fail"

    # Decode + cutout
    try:
        src_img = Image.open(BytesIO(r.content)).convert("RGBA")
        out_img = remove(src_img, session=session)
    except Exception as e:
        print(f"  [fail-process] {slug}: {e}")
        return "fail"

    # Encode + upload + DB update
    buf = BytesIO()
    out_img.save(buf, format="PNG", optimize=True)
    try:
        new_url = upload_png(slug, buf.getvalue())
        update_product_url(pid, new_url)
    except Exception as e:
        print(f"  [fail-store] {slug}: {e}")
        return "fail"

    print(f"  [ok] {slug}")
    return "ok"


def main() -> int:
    print("Loading rembg session (u2net) — first run downloads ~170MB model")
    session = new_session("u2net")

    products = fetch_live_products()
    print(f"Found {len(products)} Live products with photo URLs\n")

    counts = {"ok": 0, "skipped": 0, "fail": 0}
    for i, p in enumerate(products, 1):
        print(f"[{i}/{len(products)}] {p['slug']}")
        try:
            counts[process(p, session)] += 1
        except Exception as e:
            print(f"  [error] {p['slug']}: {e}")
            counts["fail"] += 1

    print(f"\nDone. ok={counts['ok']} skipped={counts['skipped']} fail={counts['fail']}")
    return 0 if counts["fail"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
