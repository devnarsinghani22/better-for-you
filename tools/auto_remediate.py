"""Auto-remediation for the metrics monitor_usage.py flags as CRITICAL.

Invoked from the GitHub Actions workflow when monitor_usage.py exits with
code 2 (critical). Runs a metric-specific playbook of safe, additive fixes
and writes a diagnostic report to remediation.log.

Safe operations only:
- Re-compress oversized storage objects (no deletes)
- VACUUM ANALYZE on the DB
- Report (do NOT delete) orphan storage files
- Verify the Vercel /storage/* proxy is wired in next.config.ts

Anything destructive (delete files, upgrade plan, retract products) is
deferred to a human via the GitHub issue this script opens.
"""
from __future__ import annotations
import argparse, io, json, os, pathlib, re, sys, time
from datetime import datetime, timezone

import psycopg2
import requests
from PIL import Image, ImageChops

ROOT = pathlib.Path(__file__).resolve().parents[1]
LOG = ROOT / "remediation.log"

def log(msg: str) -> None:
    line = f"{datetime.now(timezone.utc).strftime('%H:%M:%SZ')} {msg}"
    print(line)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(line + "\n")

# ---------- env loaders ----------
def env() -> dict[str, str]:
    """Read .env.local in the repo, fall back to process env."""
    out: dict[str, str] = {}
    envf = ROOT / ".env.local"
    if envf.exists():
        for line in envf.read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                out[k.strip()] = v.strip().strip('"').strip("'")
    for k in ("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_DB_PASSWORD"):
        if k in os.environ:
            out[k] = os.environ[k]
    return out

def db():
    return psycopg2.connect(
        host="aws-1-ap-south-1.pooler.supabase.com",
        port=5432,
        user="postgres.eprwzftfxtkgunnkewyk",
        password=env()["SUPABASE_DB_PASSWORD"],
        dbname="postgres",
    )

# ---------- playbook steps ----------
def verify_vercel_proxy() -> None:
    """Make sure next.config.ts still has the /storage/* rewrite."""
    cfg = (ROOT / "next.config.ts").read_text()
    if "/storage/:path*" in cfg and "rewrites" in cfg:
        log("[OK]  next.config.ts has /storage proxy rewrite.")
    else:
        log("[!!]  next.config.ts MISSING /storage proxy — egress will spike.")

def list_storage_objects(bucket: str) -> list[dict]:
    e = env()
    SB, SR = e["NEXT_PUBLIC_SUPABASE_URL"], e["SUPABASE_SERVICE_ROLE_KEY"]
    H = {"apikey": SR, "Authorization": f"Bearer {SR}", "Content-Type": "application/json"}
    all_objs: list[dict] = []
    offset = 0
    while True:
        body = {"prefix": "", "limit": 1000, "offset": offset,
                "sortBy": {"column": "name", "order": "asc"}}
        r = requests.post(f"{SB}/storage/v1/object/list/{bucket}", headers=H,
                          data=json.dumps(body), timeout=30)
        if r.status_code != 200:
            log(f"[!!]  list/{bucket} -> {r.status_code} {r.text[:120]}")
            return all_objs
        chunk = r.json()
        if not chunk:
            break
        all_objs.extend(chunk)
        if len(chunk) < 1000:
            break
        offset += 1000
    return all_objs

def recompress_oversized(buckets: tuple[str, ...] = ("products", "labels", "categories"),
                         threshold_kb: int = 200) -> int:
    """Re-encode any storage object above `threshold_kb` to a tighter WEBP.
    Returns count of objects re-uploaded."""
    e = env()
    SB, SR = e["NEXT_PUBLIC_SUPABASE_URL"], e["SUPABASE_SERVICE_ROLE_KEY"]
    H = {"apikey": SR, "Authorization": f"Bearer {SR}",
         "Cache-Control": "max-age=31536000, immutable", "x-upsert": "true"}
    count = 0
    for bucket in buckets:
        objs = list_storage_objects(bucket)
        log(f"[..]  bucket={bucket} objects={len(objs)}")
        for obj in objs:
            size = (obj.get("metadata") or {}).get("size", 0)
            if size <= threshold_kb * 1024:
                continue
            name = obj["name"]
            url = f"{SB}/storage/v1/object/public/{bucket}/{name}"
            try:
                raw = requests.get(url, timeout=30).content
                im = Image.open(io.BytesIO(raw))
                if im.mode == "RGBA":
                    bg = Image.new("RGB", im.size, (255, 255, 255))
                    bg.paste(im, mask=im.split()[3])
                    im = bg
                else:
                    im = im.convert("RGB")
                if max(im.size) > 1300:
                    im.thumbnail((1300, 1300), Image.LANCZOS)
                buf = io.BytesIO()
                im.save(buf, format="WEBP", quality=80, method=6)
                if len(buf.getvalue()) >= size * 0.85:
                    # Not enough saving to be worth re-uploading.
                    continue
                target_name = re.sub(r"\.(png|jpg|jpeg)$", ".webp", name, flags=re.I)
                ct = {"Content-Type": "image/webp", **H}
                r = requests.post(
                    f"{SB}/storage/v1/object/{bucket}/{target_name}",
                    headers=ct, data=buf.getvalue(), timeout=30,
                )
                if r.status_code in (200, 201):
                    count += 1
                    log(f"[OK]  recompress {bucket}/{name} "
                        f"{size//1024}KB -> {len(buf.getvalue())//1024}KB")
                else:
                    log(f"[!!]  upload failed for {bucket}/{name}: {r.status_code}")
            except Exception as ex:
                log(f"[!!]  {bucket}/{name}: {ex}")
    return count

def report_orphans() -> None:
    """List storage files not referenced by any DB column. Report only."""
    referenced: set[tuple[str, str]] = set()  # (bucket, name)
    conn = db()
    cur = conn.cursor()
    for table, col in [
        ("products", "product_photo_url"), ("products", "label_image_url"),
        ("products", "ingredient_image_url"), ("categories", "hero_image_url"),
        ("restaurants", "hero_image_url"), ("restaurants", "card_image_url"),
        ("dishes", "image_url"),
    ]:
        cur.execute(f"SELECT {col} FROM {table} WHERE {col} IS NOT NULL")
        for (url,) in cur.fetchall():
            # Accept both relative (/storage/...) and absolute forms.
            m = re.search(r"/storage/v1/object/(?:public/)?([^/]+)/([^?]+)", url)
            if m:
                referenced.add((m.group(1), m.group(2)))
    cur.close()
    conn.close()

    orphans_per_bucket: dict[str, list[str]] = {}
    for bucket in ("products", "labels", "categories"):
        objs = list_storage_objects(bucket)
        for o in objs:
            if (bucket, o["name"]) not in referenced:
                orphans_per_bucket.setdefault(bucket, []).append(o["name"])
    total = sum(len(v) for v in orphans_per_bucket.values())
    log(f"[..]  Orphan storage files: {total}")
    for bucket, names in orphans_per_bucket.items():
        log(f"      {bucket}: {len(names)}  (sample: {names[:3]})")
    if total:
        log("[..]  Manual review required before deleting orphans — they may be"
            " referenced from old browser caches.")

def vacuum_analyze() -> None:
    conn = db()
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("VACUUM ANALYZE")
    log("[OK]  VACUUM ANALYZE complete.")
    # Largest tables
    cur.execute("""
        SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
        FROM pg_catalog.pg_statio_user_tables
        ORDER BY pg_total_relation_size(relid) DESC
        LIMIT 8
    """)
    for name, size in cur.fetchall():
        log(f"      table {name:<30} {size}")
    cur.close()
    conn.close()

def report_runtime_state() -> None:
    """Snapshot product / category counts so the issue body has context."""
    conn = db()
    cur = conn.cursor()
    cur.execute("SELECT status, COUNT(*) FROM products GROUP BY status ORDER BY status")
    for s, c in cur.fetchall():
        log(f"      products.status={s} -> {c}")
    cur.execute("SELECT active, COUNT(*) FROM categories GROUP BY active ORDER BY active")
    for s, c in cur.fetchall():
        log(f"      categories.active={s} -> {c}")
    cur.close()
    conn.close()

# ---------- runbooks ----------
RUNBOOKS = {
    "supabase.cached_egress": [
        ("verify_vercel_proxy", verify_vercel_proxy, ()),
        ("recompress_oversized", recompress_oversized, ()),
        ("report_orphans", report_orphans, ()),
    ],
    "supabase.egress": [
        ("verify_vercel_proxy", verify_vercel_proxy, ()),
        ("report_runtime_state", report_runtime_state, ()),
    ],
    "supabase.storage_size": [
        ("recompress_oversized", recompress_oversized, ()),
        ("report_orphans", report_orphans, ()),
    ],
    "supabase.database_size": [
        ("vacuum_analyze", vacuum_analyze, ()),
        ("report_runtime_state", report_runtime_state, ()),
    ],
    "vercel.bandwidth": [
        ("verify_vercel_proxy", verify_vercel_proxy, ()),
        ("recompress_oversized", recompress_oversized, ()),
    ],
}

def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--metric", required=True, help="e.g. supabase.cached_egress")
    args = p.parse_args()

    log(f"=== Auto-remediation for {args.metric} ===")
    playbook = RUNBOOKS.get(args.metric)
    if not playbook:
        log(f"[??]  No runbook for {args.metric}; manual review required.")
        return 1
    for name, fn, kwargs in playbook:
        log(f">>> {name}")
        try:
            fn(*kwargs) if isinstance(kwargs, tuple) else fn(**kwargs)
        except Exception as ex:
            log(f"[!!]  {name} crashed: {ex}")
    log(f"=== Done. Review {LOG.name} for full trace. ===")
    return 0

if __name__ == "__main__":
    sys.exit(main())
