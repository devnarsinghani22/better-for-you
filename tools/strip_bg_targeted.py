"""
strip_bg_targeted.py — Re-process specific products with alpha-matting enabled.

Pass slugs as CLI args. Higher-quality (slower) edges than the default
strip_bg.py run. Uses the same upload + DB-update flow.
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

REST_HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
}


def fetch_products(slugs: list[str]) -> list[dict]:
    in_list = ",".join(slugs)
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/products",
        headers=REST_HEADERS,
        params={
            "select": "id,slug,product_photo_url",
            "slug": f"in.({in_list})",
        },
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def upload_png(slug: str, png_bytes: bytes) -> str:
    object_path = f"{slug}-nobg.png"
    r = requests.post(
        f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{object_path}",
        headers={**REST_HEADERS, "Content-Type": "image/png", "x-upsert": "true"},
        data=png_bytes,
        timeout=120,
    )
    if r.status_code not in (200, 201):
        raise RuntimeError(f"upload failed {r.status_code}: {r.text}")
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{object_path}"


def update_product_url(product_id: int, new_url: str) -> None:
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/products",
        headers={**REST_HEADERS, "Content-Type": "application/json", "Prefer": "return=minimal"},
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
    print(f"[{slug}] downloading {src_url[:80]}...")

    r = requests.get(
        src_url,
        timeout=60,
        headers={"User-Agent": "Mozilla/5.0 FoodPharmer-Approved/1.0"},
    )
    r.raise_for_status()

    src_img = Image.open(BytesIO(r.content)).convert("RGBA")
    print(f"[{slug}] running rembg with alpha matting ({src_img.size[0]}x{src_img.size[1]})...")
    out_img = remove(
        src_img,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )

    buf = BytesIO()
    out_img.save(buf, format="PNG", optimize=True)
    new_url = upload_png(slug, buf.getvalue())
    update_product_url(pid, new_url)
    print(f"[{slug}] -> {new_url}")
    return "ok"


def main() -> int:
    slugs = sys.argv[1:]
    if not slugs:
        print("usage: strip_bg_targeted.py <slug> [<slug> ...]")
        return 2

    print(f"Loading rembg u2net session (alpha matting)")
    session = new_session("u2net")

    products = fetch_products(slugs)
    if not products:
        print(f"No products found for: {slugs}")
        return 1

    for p in products:
        try:
            process(p, session)
        except Exception as e:
            print(f"[{p['slug']}] FAILED: {e}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
