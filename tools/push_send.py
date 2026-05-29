"""Send push notifications to app users via FCM HTTP v1.

Two modes:
  Broadcast:  python push_send.py --title "..." --body "..." [--url "..."]
  Digest:     python push_send.py --digest   (new Live products since last digest)

Credentials: service-account JSON in env GOOGLE_SERVICE_ACCOUNT_JSON (raw JSON
string — store as a GitHub secret) OR --sa path/to/serviceAccount.json.
DB password in SUPABASE_DB_PASSWORD (env or .env.local).

Dormant until the service account exists. Add --dry-run to preview without sending.
Invalid/unregistered tokens are auto-disabled (enabled=false) so the list self-cleans.
"""
import argparse, json, os, sys
import requests
import psycopg2

FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging"
SITE = "https://foodpharmer.health"
DB = dict(host="aws-1-ap-south-1.pooler.supabase.com", port=5432,
          user="postgres.eprwzftfxtkgunnkewyk", dbname="postgres", sslmode="require")


def load_env():
    if os.path.exists(".env.local"):
        for line in open(".env.local", encoding="utf-8"):
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"'))


def db():
    pw = os.environ["SUPABASE_DB_PASSWORD"]
    return psycopg2.connect(password=pw, **DB)


def access_token(sa_info):
    """OAuth2 access token for FCM from the service account."""
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request
    creds = service_account.Credentials.from_service_account_info(
        sa_info, scopes=[FCM_SCOPE])
    creds.refresh(Request())
    return creds.token


def build_digest(conn):
    """Compose (title, body, url) from new Live products since the last digest.
    Returns None when there is nothing new — caller should skip sending."""
    cur = conn.cursor()
    cur.execute("select max(created_at) from push_sends where kind='digest'")
    since = cur.fetchone()[0]
    if since is None:
        cur.execute("""select p.name, b.name from products p
                       left join brands b on b.id=p.brand_id
                       where p.status='Live' and p.created_at >= now() - interval '7 days'
                       order by p.created_at desc""")
    else:
        cur.execute("""select p.name, b.name from products p
                       left join brands b on b.id=p.brand_id
                       where p.status='Live' and p.created_at > %s
                       order by p.created_at desc""", (since,))
    rows = cur.fetchall()
    if not rows:
        return None
    n = len(rows)
    if n == 1:
        title = "A new pick on Better for You"
        body = f"{rows[0][0]} just made the list. Tap to see why."
    else:
        names = ", ".join(r[0] for r in rows[:3])
        more = f" +{n-3} more" if n > 3 else ""
        title = f"{n} new picks on Better for You"
        body = f"{names}{more}. All label-checked, not sponsored."
    return title, body, SITE


def fetch_tokens(conn):
    cur = conn.cursor()
    cur.execute("select token, platform from push_tokens where enabled = true")
    return cur.fetchall()


def send_one(project_id, bearer, token, title, body, url):
    msg = {
        "message": {
            "token": token,
            "notification": {"title": title, "body": body},
            "android": {"priority": "high", "notification": {"default_sound": True}},
            "apns": {"payload": {"aps": {"sound": "default"}}},
        }
    }
    if url:
        msg["message"]["data"] = {"url": url}
    r = requests.post(
        f"https://fcm.googleapis.com/v1/projects/{project_id}/messages:send",
        headers={"Authorization": f"Bearer {bearer}", "Content-Type": "application/json"},
        data=json.dumps(msg), timeout=30)
    return r


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--title")
    ap.add_argument("--body")
    ap.add_argument("--url")
    ap.add_argument("--digest", action="store_true")
    ap.add_argument("--sa", help="path to serviceAccount.json (else GOOGLE_SERVICE_ACCOUNT_JSON env)")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    load_env()

    conn = db()

    if a.digest:
        d = build_digest(conn)
        if d is None:
            print("digest: nothing new since last send — skipping.")
            return
        title, body, url = d
        kind = "digest"
    else:
        if not a.title or not a.body:
            sys.exit("broadcast needs --title and --body")
        title, body, url, kind = a.title, a.body, a.url, "broadcast"

    tokens = fetch_tokens(conn)
    print(f"[{kind}] {title!r} / {body!r} url={url} -> {len(tokens)} device(s)")

    if a.dry_run:
        print("dry-run: not sending, not logging.")
        return
    if not tokens:
        print("no enabled tokens — nothing to send.")
        return

    # Credentials only needed for a real send.
    if a.sa:
        sa_info = json.load(open(a.sa, encoding="utf-8"))
    else:
        raw = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
        if not raw:
            sys.exit("missing GOOGLE_SERVICE_ACCOUNT_JSON (or pass --sa)")
        sa_info = json.loads(raw)
    project_id = sa_info["project_id"]
    bearer = access_token(sa_info)

    sent = failed = 0
    dead = []
    for token, _plat in tokens:
        r = send_one(project_id, bearer, token, title, body, url)
        if r.status_code == 200:
            sent += 1
        else:
            failed += 1
            # 404 UNREGISTERED / 400 INVALID_ARGUMENT => stale token, disable it.
            if r.status_code in (400, 404):
                dead.append(token)
            else:
                print(f"  send error {r.status_code}: {r.text[:160]}")

    cur = conn.cursor()
    if dead:
        cur.execute("update push_tokens set enabled=false where token = any(%s)", (dead,))
    cur.execute(
        "insert into push_sends (kind,title,body,url,sent_count,failed_count) values (%s,%s,%s,%s,%s,%s)",
        (kind, title, body, url, sent, failed))
    conn.commit()
    print(f"done: sent={sent} failed={failed} disabled_stale={len(dead)}")


if __name__ == "__main__":
    main()
