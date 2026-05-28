"""Pulls current usage for Vercel + Supabase, prints a status table,
exits non-zero when any metric crosses warn/crit thresholds.

Designed to be run from a GitHub Actions cron every few hours. A non-zero
exit triggers the workflow's failure notification (GitHub emails the repo
owner by default).

Env vars:
  VERCEL_TOKEN              - https://vercel.com/account/tokens
  SUPABASE_ACCESS_TOKEN     - https://supabase.com/dashboard/account/tokens
                              (personal access token, org-scoped)
"""
from __future__ import annotations
import json, os, pathlib, sys, urllib.request, urllib.error, urllib.parse
from datetime import datetime, timezone

VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")
SB_TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
SB_PROJECT_REF = os.environ.get("SUPABASE_PROJECT_REF", "eprwzftfxtkgunnkewyk")
VERCEL_PROJECT_ID = os.environ.get("VERCEL_PROJECT_ID", "prj_RZB9OACBBjkLyiOGHBMcThanArXk")
VERCEL_TEAM_ID = os.environ.get("VERCEL_TEAM_ID", "team_6e5bDNbX2Kyre4b0wX3hppzy")
SB_DB_PASSWORD = os.environ.get("SUPABASE_DB_PASSWORD", "")
SB_SERVICE_ROLE = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SB_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://eprwzftfxtkgunnkewyk.supabase.co")

# Fallback: load missing values from repo-local .env.local for local runs.
ENVF = pathlib.Path(__file__).resolve().parents[1] / ".env.local"
if ENVF.exists():
    for line in ENVF.read_text().splitlines():
        if "=" not in line or line.strip().startswith("#"):
            continue
        k, v = line.split("=", 1)
        v = v.strip().strip('"').strip("'")
        if k.strip() == "SUPABASE_DB_PASSWORD" and not SB_DB_PASSWORD:
            SB_DB_PASSWORD = v
        elif k.strip() == "SUPABASE_SERVICE_ROLE_KEY" and not SB_SERVICE_ROLE:
            SB_SERVICE_ROLE = v
        elif k.strip() == "VERCEL_TOKEN" and not VERCEL_TOKEN:
            VERCEL_TOKEN = v
        elif k.strip() == "SUPABASE_ACCESS_TOKEN" and not SB_TOKEN:
            SB_TOKEN = v

# Thresholds (percent of plan quota).
# WARN -> printed in stdout but exit 0; CRIT -> exit 2.
# Keep CRIT well under 100 so we have time to react before Supabase 402s
# or Vercel throttles.
THRESHOLDS = {
    "supabase.cached_egress":  {"warn": 50, "crit": 75},
    "supabase.egress":         {"warn": 50, "crit": 75},
    "supabase.database_size":  {"warn": 60, "crit": 80},
    "supabase.storage_size":   {"warn": 60, "crit": 80},
    "supabase.monthly_active_users": {"warn": 70, "crit": 90},
    "vercel.bandwidth":        {"warn": 50, "crit": 75},
}

# Free-plan quotas (used when the API returns absolute usage without limits).
DEFAULT_LIMITS = {
    "supabase.cached_egress":  5 * 1024**3,    # 5 GB
    "supabase.egress":         5 * 1024**3,    # 5 GB
    "supabase.database_size":  500 * 1024**2,  # 500 MB
    "supabase.storage_size":   1 * 1024**3,    # 1 GB
    "supabase.monthly_active_users": 50_000,
    "vercel.bandwidth":        100 * 1024**3,  # 100 GB Hobby
}


UA = "Mozilla/5.0 (compatible; foodpharmer-monitor/1.0)"

def http_get(url: str, headers: dict | None = None) -> dict:
    h = {"User-Agent": UA, "Accept": "application/json", **(headers or {})}
    req = urllib.request.Request(url, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"_error": e.code, "_body": e.read().decode("utf-8", "ignore")[:500]}
    except Exception as e:
        return {"_error": str(e)}


def fmt_bytes(n: float) -> str:
    if n is None:
        return "?"
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if n < 1024:
            return f"{n:.2f} {unit}"
        n /= 1024
    return f"{n:.2f} PB"


# ---------- Supabase ----------
# The public Management API does not expose /usage on the free tier (404s on
# every documented variant). We measure what we *can* directly:
#   - database_size  via pg_database_size()
#   - storage_size   via summing object metadata from the public list endpoint
#   - cached_egress  CANNOT be measured programmatically; surface a pointer to
#                    the Supabase dashboard and rely on Vercel's edge-cache
#                    HIT/MISS ratio (probe a known image) as an early signal.
def _row(metric: str, used, limit, note=""):
    pct = (used / limit * 100) if (used is not None and limit) else None
    return {"metric": metric, "used": used, "limit": limit, "pct": pct, "note": note}

def supabase_database_size() -> dict:
    try:
        import psycopg2
    except ImportError:
        return _row("supabase.database_size", None, DEFAULT_LIMITS["supabase.database_size"],
                    note="psycopg2 not installed")
    if not SB_DB_PASSWORD:
        return _row("supabase.database_size", None, DEFAULT_LIMITS["supabase.database_size"],
                    note="SUPABASE_DB_PASSWORD not set")
    try:
        conn = psycopg2.connect(
            host="aws-1-ap-south-1.pooler.supabase.com", port=5432,
            user=f"postgres.{SB_PROJECT_REF}", password=SB_DB_PASSWORD,
            dbname="postgres", connect_timeout=10,
        )
        cur = conn.cursor()
        cur.execute("SELECT pg_database_size(current_database())")
        size = cur.fetchone()[0]
        cur.close(); conn.close()
        return _row("supabase.database_size", size, DEFAULT_LIMITS["supabase.database_size"])
    except Exception as e:
        return _row("supabase.database_size", None, DEFAULT_LIMITS["supabase.database_size"],
                    note=f"db query failed: {e}")

def supabase_storage_size() -> dict:
    if not SB_SERVICE_ROLE:
        return _row("supabase.storage_size", None, DEFAULT_LIMITS["supabase.storage_size"],
                    note="SUPABASE_SERVICE_ROLE_KEY not set")
    H = {"apikey": SB_SERVICE_ROLE, "Authorization": f"Bearer {SB_SERVICE_ROLE}",
         "Content-Type": "application/json"}
    total = 0
    bucket_count = 0
    try:
        # List buckets
        req = urllib.request.Request(f"{SB_URL}/storage/v1/bucket", headers={**H, "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as r:
            buckets = json.loads(r.read())
        for b in buckets:
            offset = 0
            while True:
                body = json.dumps({"prefix": "", "limit": 1000, "offset": offset,
                                   "sortBy": {"column": "name", "order": "asc"}}).encode()
                rq = urllib.request.Request(
                    f"{SB_URL}/storage/v1/object/list/{b['name']}",
                    data=body, headers=H, method="POST",
                )
                with urllib.request.urlopen(rq, timeout=30) as r:
                    chunk = json.loads(r.read())
                if not chunk:
                    break
                for o in chunk:
                    total += (o.get("metadata") or {}).get("size", 0) or 0
                if len(chunk) < 1000:
                    break
                offset += 1000
            bucket_count += 1
        return _row("supabase.storage_size", total, DEFAULT_LIMITS["supabase.storage_size"],
                    note=f"summed across {bucket_count} buckets")
    except Exception as e:
        return _row("supabase.storage_size", None, DEFAULT_LIMITS["supabase.storage_size"],
                    note=f"storage list failed: {e}")

def supabase_cached_egress_hint() -> dict:
    # Heuristic only: probe a known immutable image through the Vercel proxy
    # and report the cache state. A growing % of HITs implies egress to
    # Supabase is dropping. No way to read the actual byte counter.
    try:
        req = urllib.request.Request(
            "https://foodpharmer.health/storage/v1/object/public/categories/biscuits.webp",
            method="HEAD",
            headers={"User-Agent": UA},
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            cache = r.headers.get("x-vercel-cache", "?")
            return _row("supabase.cached_egress", None,
                        DEFAULT_LIMITS["supabase.cached_egress"],
                        note=f"x-vercel-cache={cache} on sample probe — Supabase dashboard "
                             f"https://supabase.com/dashboard/project/{SB_PROJECT_REF}/usage "
                             "is the source of truth.")
    except Exception as e:
        return _row("supabase.cached_egress", None,
                    DEFAULT_LIMITS["supabase.cached_egress"], note=f"probe failed: {e}")

def supabase_usage() -> list[dict]:
    return [
        supabase_database_size(),
        supabase_storage_size(),
        supabase_cached_egress_hint(),
    ]


# ---------- Vercel ----------
def vercel_usage() -> list[dict]:
    if not VERCEL_TOKEN:
        return [{
            "metric": "vercel.*", "used": None, "limit": None, "pct": None,
            "note": "VERCEL_TOKEN not set",
        }]
    H = {"Authorization": f"Bearer {VERCEL_TOKEN}"}
    # Vercel exposes per-team usage at /v1/teams/{id}/usage but only on Pro+.
    # On Hobby we approximate via the analytics endpoints or fall back to
    # build/deploy counts.
    out: list[dict] = []

    # Approximate bandwidth: list deployments and rely on the user's separate
    # Vercel dashboard email alerts. We surface at least deployment counts so
    # outages are visible.
    last_24h = http_get(
        "https://api.vercel.com/v6/deployments?"
        + urllib.parse.urlencode({
            "projectId": VERCEL_PROJECT_ID,
            "teamId": VERCEL_TEAM_ID,
            "limit": 50,
        }),
        H,
    )
    deps = (last_24h or {}).get("deployments", [])
    bad = [d for d in deps if d.get("state") in {"ERROR", "CANCELED"}]
    out.append({
        "metric": "vercel.recent_deployments", "used": len(deps), "limit": None,
        "pct": None,
        "note": f"{len(bad)} failed/cancelled in window" if bad else "",
    })

    out.append({
        "metric": "vercel.bandwidth", "used": None,
        "limit": DEFAULT_LIMITS["vercel.bandwidth"], "pct": None,
        "note": "Hobby plan exposes no machine-readable bandwidth metric — "
                "rely on Vercel's own 75/90/100% email alerts.",
    })
    return out


def main() -> int:
    print(f"# Usage report — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}\n")
    rows = supabase_usage() + vercel_usage()

    breached_warn = []
    breached_crit = []
    for r in rows:
        pct = r["pct"]
        thr = THRESHOLDS.get(r["metric"])
        flag = ""
        if pct is not None and thr:
            if pct >= thr["crit"]:
                flag = " CRITICAL"
                breached_crit.append(r["metric"])
            elif pct >= thr["warn"]:
                flag = " WARN"
                breached_warn.append(r["metric"])
        used = fmt_bytes(r["used"]) if isinstance(r["used"], (int, float)) and r["used"] is not None and r["metric"].endswith(("egress", "size", "bandwidth")) else r["used"]
        limit = fmt_bytes(r["limit"]) if isinstance(r["limit"], (int, float)) and r["limit"] is not None and r["metric"].endswith(("egress", "size", "bandwidth")) else r["limit"]
        pct_s = f"{pct:.1f}%" if isinstance(pct, (int, float)) else "?"
        print(f"  {r['metric']:<38}  {str(used):>12}  /  {str(limit):>12}  ({pct_s:>7}){flag}")
        if r["note"]:
            print(f"      note: {r['note']}")

    print()
    if breached_crit:
        print(f"CRITICAL: {', '.join(breached_crit)}")
    if breached_warn:
        print(f"WARN: {', '.join(breached_warn)}")
    if not (breached_crit or breached_warn):
        print("All metrics within thresholds.")

    return 2 if breached_crit else (1 if breached_warn else 0)


if __name__ == "__main__":
    sys.exit(main())
