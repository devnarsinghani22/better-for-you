"""Daily Microsoft Clarity digest. Pulls yesterday's traffic metrics and
emits a compact markdown report (stdout). Designed to be wrapped by a
GitHub Actions workflow that opens / updates a GitHub issue with the
output.

Five API calls per run (the Clarity Data Export API rate limit is
~10/day per project token).

Env:
  CLARITY_API_TOKEN  - Clarity dashboard -> Settings -> Data Export
"""
from __future__ import annotations
import json, os, sys, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone

TOKEN = os.environ.get("CLARITY_API_TOKEN")
if not TOKEN:
    # Fallback to repo-local .env.local for local runs.
    import pathlib
    envf = pathlib.Path(__file__).resolve().parents[1] / ".env.local"
    if envf.exists():
        for line in envf.read_text().splitlines():
            if line.startswith("CLARITY_API_TOKEN="):
                TOKEN = line.split("=", 1)[1].strip().strip('"').strip("'")
                break
if not TOKEN:
    print("ERROR: CLARITY_API_TOKEN not set.", file=sys.stderr)
    sys.exit(1)

API = "https://www.clarity.ms/export-data/api/v1/project-live-insights"

def fetch(qs: str) -> list[dict] | None:
    req = urllib.request.Request(
        f"{API}?{qs}",
        headers={"Authorization": f"Bearer {TOKEN}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        print(f"<!-- clarity {qs} -> {e.code} {e.read()[:200].decode('utf-8','ignore')} -->",
              file=sys.stderr)
        return None
    except Exception as e:
        print(f"<!-- clarity {qs} -> {e} -->", file=sys.stderr)
        return None

def metric_value(payload: list[dict], metric: str, field: str = "value") -> int | float | None:
    """Pull a top-level metric value (e.g. ScrollDepth, EngagementTime)."""
    for m in payload or []:
        if m.get("metricName") == metric:
            info = m.get("information") or []
            if info and field in info[0]:
                try:
                    return float(info[0][field])
                except (TypeError, ValueError):
                    return info[0][field]
    return None

def metric_rows(payload: list[dict], metric: str, key_field: str, val_field: str = "totalSessionCount") -> list[tuple[str, int]]:
    # Clarity is inconsistent about key casing — try the documented key, then
    # the common case-variants. Strip rows where the key is None (those are
    # aggregated/bot roll-ups that bypass the dimension).
    candidates = [key_field, key_field.capitalize(), key_field.lower(), key_field.upper()]
    for m in payload or []:
        if m.get("metricName") != metric:
            continue
        rows: list[tuple[str, int]] = []
        for r in m.get("information") or []:
            k = None
            for c in candidates:
                if c in r and r[c] is not None:
                    k = r[c]
                    break
            if k is None:
                continue
            try:
                v = int(r.get(val_field, 0))
            except (TypeError, ValueError):
                v = 0
            rows.append((str(k), v))
        rows.sort(key=lambda x: -x[1])
        return rows
    return []


def short_url(u: str) -> str:
    u = u.replace("https://foodpharmer.health", "").replace("http://foodpharmer.health", "")
    if "?" in u:
        u = u.split("?", 1)[0]  # strip query / utm params
    return u[:70] or "/"

def hr(n: int) -> str:
    return f"{n:,}"

def main() -> int:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    yest = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    print(f"# Clarity digest — {yest}")
    print()
    print(f"_Generated {today} UTC. Window: previous 24h._")
    print()

    # 1) Overall traffic
    overall = fetch("numOfDays=1")
    sessions = metric_value(overall or [], "Traffic", "totalSessionCount") or 0
    pageviews = metric_value(overall or [], "Traffic", "pagesPerSessionPercentage")  # depends on API shape
    if not sessions:
        # Some Clarity tenants return Traffic only as breakdowns; sum from URL pull below.
        sessions = None
    print("## Headline")
    print(f"- **Sessions (last 24h):** {hr(int(sessions))}" if sessions else "- **Sessions:** (not available)")
    bounce = metric_value(overall or [], "EngagementTime", "averageEngagementTime")
    if bounce:
        print(f"- **Avg engagement:** {bounce:.1f}s")
    rage = metric_value(overall or [], "RageClickCount", "subTotal")
    if rage is not None:
        print(f"- **Rage clicks:** {int(rage)}")
    dead = metric_value(overall or [], "DeadClickCount", "subTotal")
    if dead is not None:
        print(f"- **Dead clicks:** {int(dead)}")
    print()

    # 2) Top pages + per-page click breakdown (Traffic + Dead/Rage/QuickBack
    # all come back in the same response, so one fetch covers all of it).
    url_data = fetch("numOfDays=1&dimension1=URL")
    page_rows = metric_rows(url_data or [], "Traffic", "Url")
    dead_rows = dict(metric_rows(url_data or [], "DeadClickCount", "Url", val_field="subTotal"))
    rage_rows = dict(metric_rows(url_data or [], "RageClickCount", "Url", val_field="subTotal"))
    qb_rows = dict(metric_rows(url_data or [], "QuickbackClick", "Url", val_field="subTotal"))
    if page_rows:
        print("## Top pages")
        print()
        print("| Page | Sessions | Dead clicks | Rage clicks | Quick-back |")
        print("|---|---:|---:|---:|---:|")
        for url, s in page_rows[:12]:
            print(f"| `{short_url(url)}` | {hr(s)} | "
                  f"{hr(dead_rows.get(url, 0))} | "
                  f"{hr(rage_rows.get(url, 0))} | "
                  f"{hr(qb_rows.get(url, 0))} |")
        print()
        # Highlight the worst per-page dead-click rate on pages with real volume
        risky = [(u, s, dead_rows.get(u, 0)) for u, s in page_rows[:20] if s >= 100]
        risky.sort(key=lambda x: -(x[2] / x[1]) if x[1] else 0)
        if risky and risky[0][2] / max(risky[0][1], 1) > 0.3:
            u, s, d = risky[0]
            pct = d / s * 100 if s else 0
            print(f"_Dead-click hotspot:_ `{short_url(u)}` — {hr(d)} dead clicks / {hr(s)} sessions = {pct:.0f}%")
            print()

    # 3) Sources
    src_data = fetch("numOfDays=1&dimension1=Source")
    rows = metric_rows(src_data or [], "Traffic", "Source")
    if rows:
        print("## Top traffic sources")
        for src, s in rows[:8]:
            if s > 0:
                print(f"- {src or '(direct)'} — **{hr(s)}**")
        print()

    # 4) Devices
    dev_data = fetch("numOfDays=1&dimension1=Device")
    rows = metric_rows(dev_data or [], "Traffic", "Device")
    if rows:
        total = sum(s for _, s in rows) or 1
        print("## Devices")
        for dev, s in rows:
            pct = s / total * 100
            print(f"- {dev}: **{hr(s)}** ({pct:.0f}%)")
        print()

    # 5) Countries
    geo_data = fetch("numOfDays=1&dimension1=Country")
    rows = metric_rows(geo_data or [], "Traffic", "Country")
    if rows:
        print("## Top countries")
        for c, s in rows[:6]:
            print(f"- {c}: **{hr(s)}**")
        print()

    # 6) Outbound buy clicks per product (from our own click_events table,
    # populated by <BuyLink> beacons + the /api/search miss logger).
    db_section()

    print("---")
    print("_5 of ~10 daily Clarity API calls used by this report._")
    return 0


def db_section() -> None:
    """Top buy-clicked products + most common failed searches in the last 24h."""
    db_pw = os.environ.get("SUPABASE_DB_PASSWORD")
    if not db_pw:
        envf = pathlib.Path(__file__).resolve().parents[1] / ".env.local"
        if envf.exists():
            for line in envf.read_text().splitlines():
                if line.startswith("SUPABASE_DB_PASSWORD="):
                    db_pw = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    if not db_pw:
        return
    try:
        import psycopg2
    except ImportError:
        return
    try:
        conn = psycopg2.connect(
            host="aws-1-ap-south-1.pooler.supabase.com", port=5432,
            user="postgres.eprwzftfxtkgunnkewyk", password=db_pw,
            dbname="postgres", connect_timeout=10,
        )
        cur = conn.cursor()
        cur.execute("""
            SELECT slug, COUNT(*) AS clicks
            FROM click_events
            WHERE type = 'outbound'
              AND created_at >= NOW() - INTERVAL '24 hours'
              AND slug IS NOT NULL
            GROUP BY slug
            ORDER BY clicks DESC
            LIMIT 12
        """)
        outbound = cur.fetchall()
        if outbound:
            print("## Top buy-button clicks (last 24h)")
            print()
            print("| Product | Clicks |")
            print("|---|---:|")
            for slug, n in outbound:
                print(f"| `{slug}` | {n} |")
            print()
        cur.execute("""
            SELECT LOWER(query) AS q, COUNT(*) AS hits
            FROM click_events
            WHERE type = 'search_miss'
              AND created_at >= NOW() - INTERVAL '24 hours'
              AND query IS NOT NULL
            GROUP BY LOWER(query)
            ORDER BY hits DESC, q
            LIMIT 15
        """)
        misses = cur.fetchall()
        if misses:
            print("## Failed searches (0 results)")
            print()
            for q, n in misses:
                print(f"- `{q}` — {n}")
            print()
            print("_These are real demand signals — products to source or "
                  "categories to launch next._")
            print()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"<!-- db_section error: {e} -->")

if __name__ == "__main__":
    sys.exit(main())
