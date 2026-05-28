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
import json, os, sys, urllib.request, urllib.error, urllib.parse
from datetime import datetime, timezone

VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")
SB_TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
SB_PROJECT_REF = os.environ.get("SUPABASE_PROJECT_REF", "eprwzftfxtkgunnkewyk")
VERCEL_PROJECT_ID = os.environ.get("VERCEL_PROJECT_ID", "prj_RZB9OACBBjkLyiOGHBMcThanArXk")
VERCEL_TEAM_ID = os.environ.get("VERCEL_TEAM_ID", "team_6e5bDNbX2Kyre4b0wX3hppzy")

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


def http_get(url: str, headers: dict | None = None) -> dict:
    req = urllib.request.Request(url, headers=headers or {})
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
def supabase_usage() -> list[dict]:
    if not SB_TOKEN:
        return [{
            "metric": "supabase.*", "used": None, "limit": None,
            "pct": None, "note": "SUPABASE_ACCESS_TOKEN not set",
        }]
    H = {"Authorization": f"Bearer {SB_TOKEN}", "Accept": "application/json"}
    out: list[dict] = []

    # 1) Find org for this project to query billing
    projects = http_get("https://api.supabase.com/v1/projects", H)
    if isinstance(projects, dict) and projects.get("_error"):
        out.append({"metric": "supabase.api", "used": None, "limit": None,
                    "pct": None, "note": f"projects list failed: {projects}"})
        return out
    org_id = None
    for p in projects:
        if p.get("id") == SB_PROJECT_REF:
            org_id = p.get("organization_id")
            break
    if not org_id:
        out.append({"metric": "supabase.api", "used": None, "limit": None,
                    "pct": None, "note": f"project {SB_PROJECT_REF} not found in token's orgs"})
        return out

    # 2) Pull usage. The exact endpoint varies; try the known ones.
    candidates = [
        f"https://api.supabase.com/v1/organizations/{org_id}/usage",
        f"https://api.supabase.com/v1/organizations/{org_id}/billing/usage",
        f"https://api.supabase.com/v1/projects/{SB_PROJECT_REF}/usage",
    ]
    payload = None
    for url in candidates:
        r = http_get(url, H)
        if r and not (isinstance(r, dict) and r.get("_error")):
            payload = r
            break
    if not payload:
        out.append({"metric": "supabase.api", "used": None, "limit": None,
                    "pct": None, "note": "no usage endpoint responded"})
        return out

    # The response shape on the Management API is a list of metric objects
    # with name, usage, limit (sometimes pricing_free_units). Normalise loosely.
    def metric_row(api_key: str, my_key: str, items) -> dict | None:
        for it in items or []:
            name = (it.get("metric") or it.get("name") or "").lower()
            if api_key in name:
                used = it.get("usage") or it.get("used") or it.get("value") or 0
                lim = it.get("pricing_free_units") or it.get("limit") or DEFAULT_LIMITS[my_key]
                pct = (used / lim * 100) if lim else None
                return {"metric": my_key, "used": used, "limit": lim, "pct": pct, "note": ""}
        return None

    items = payload if isinstance(payload, list) else payload.get("metrics") or payload.get("usage") or []

    for api_key, my_key in [
        ("egress_cached", "supabase.cached_egress"),
        ("egress", "supabase.egress"),
        ("db_size", "supabase.database_size"),
        ("storage_size", "supabase.storage_size"),
        ("monthly_active_users", "supabase.monthly_active_users"),
    ]:
        row = metric_row(api_key, my_key, items)
        if row:
            # Avoid double-matching: "egress" matches "egress_cached" too; prefer the
            # more-specific match by removing it from items once consumed.
            items = [it for it in items if (it.get("metric") or it.get("name") or "").lower() != api_key]
            out.append(row)
        else:
            out.append({"metric": my_key, "used": None, "limit": DEFAULT_LIMITS[my_key],
                        "pct": None, "note": "metric not found in payload"})
    return out


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
