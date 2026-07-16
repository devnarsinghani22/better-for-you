# Better for You (foodpharmer.health) - Handover

Written 2026-07-16 for the transfer of the project from Dev Narsinghani to Shivam
(shivamagwl02@gmail.com). This file lists every account the project depends on, where
the secrets live, and the rules that keep the site cheap and on-brand. No secret values
are in this file or anywhere in git.

## What this project is

Next.js 16 app deployed on Vercel, data on Supabase, fronted by Cloudflare on
foodpharmer.health. Products are curated through an admin workflow
(Draft -> Vetted -> Live) at /admin. PROD deploys from `master`, staging previews from
`staging`.

## Accounts to transfer (in this order)

| # | Service | What | How |
|---|---------|------|-----|
| 1 | GitHub | repo `devnarsinghani22/better-for-you` | Shivam's account is `shivam-jpegs` (invited as admin collaborator 2026-07-16). Settings -> transfer ownership to `shivam-jpegs`. Actions secrets move with the repo. |
| 2 | Vercel (paid team) | project `better-for-you` (id prj_RZB9OACBBjkLyiOGHBMcThanArXk) on team devnarsinghani22s-projects | Do NOT move the project. Invite Shivam to the team, promote to Owner, he replaces the payment method, Dev leaves. Env vars, domains and deploys stay untouched. Only the Git connection needs reconnecting after the GitHub repo transfer (step 1). |
| 3 | Supabase (paid org) | project `eprwzftfxtkgunnkewyk` (all data, storage, auth) | Do NOT migrate the project. Invite shivamagwl02@gmail.com to the org as Owner, he takes over billing, then Dev leaves the org. Zero downtime, keys unchanged. |
| 4 | Cloudflare | zone foodpharmer.health (DNS, cache rules, WAF scraper rules) + R2 bucket | Add Shivam as account member with admin, or move the zone to his account (if moved, recreate the cache rule on /storage/* and the WAF rules, and update nameservers at the registrar). |
| 5 | Domain registrar | foodpharmer.health | Wherever the domain is registered: transfer or add Shivam. Without this, nothing else can be re-pointed later. |
| 6 | Hostinger mail | hello@foodpharmer.net mailbox (SMTP sender for all site email) | Share mailbox credentials through a secure channel; rotate the password after handover. |
| 7 | Google Search Console | property foodpharmer.health + GCP service account `gsc-indexer` (Indexing API) | Add Shivam as GSC Owner. Share or re-create the service-account key (local file, not in git). |
| 8 | Microsoft Clarity | foodpharmer.health behavioural analytics | Add Shivam to the Clarity project team. API token is in env. |
| 9 | Site admin | /admin login (Supabase auth, roles preparer/reviewer) | DONE 2026-07-16: shivamagwl02@gmail.com added to admin_users as `reviewer`. Login is a magic link at /login (the auth user auto-creates on first sign-in). He is the only reviewer; Dev's row is `preparer`. |

## Step-by-step runbook

Do these in order. Steps 1 and 2 belong together (the Vercel Git connection breaks the
moment the repo transfers).

### 0. Prerequisites
- Shivam accepts the GitHub collaborator invite (github.com/devnarsinghani22/better-for-you/invitations)
  and enables 2FA on `shivam-jpegs` (github.com/settings/security).
- Agree on one secure channel for secrets (password manager share or self-destructing
  note). Never plain email or chat.

### 1. GitHub repo transfer
1. github.com/devnarsinghani22/better-for-you -> Settings -> Danger Zone -> Transfer ownership.
2. New owner: `shivam-jpegs`, type the repo name to confirm.
3. Shivam accepts the transfer email within 24h. Repo becomes
   `shivam-jpegs/better-for-you`; old URLs redirect; Actions secrets, webhooks and
   settings move with it.
4. Update local remotes: `git remote set-url origin https://github.com/shivam-jpegs/better-for-you.git`

### 2. Reconnect Vercel to the moved repo (immediately after step 1)
1. Vercel -> team devnarsinghani22s-projects -> project better-for-you -> Settings -> Git.
2. Disconnect the stale repo, then Connect Git Repository -> GitHub -> shivam-jpegs/better-for-you.
3. If the repo is not listed, Shivam installs the Vercel GitHub App on his account:
   github.com/apps/vercel -> Configure -> grant access to better-for-you.
4. Verify Production Branch is still `master`, then push a trivial commit to `staging`
   and confirm a preview deploy fires.

### 3. Vercel team ownership + billing
1. Team Settings -> Members -> Invite shivamagwl02@gmail.com.
2. After he accepts, change his role to Owner.
3. He replaces the payment method: Team Settings -> Billing -> Payment Method
   (add his card, remove Dev's).
4. Pro bills per seat (~$20/mo each), so keep the two-member overlap short.
5. Dev leaves: Members -> Leave Team (or Shivam removes Dev).

### 4. Supabase org ownership + billing
1. supabase.com/dashboard -> the org owning project eprwzftfxtkgunnkewyk -> Team ->
   Invite shivamagwl02@gmail.com as Owner.
2. He accepts (creates a Supabase account on that email).
3. He swaps billing: Org Settings -> Billing -> Payment methods.
4. Dev leaves the org. Keys, URL and data are untouched; zero downtime.

### 5. Cloudflare (recommended: add member, do not move the zone)
1. dash.cloudflare.com -> Manage Account -> Members -> Invite shivamagwl02@gmail.com,
   scope All domains, role Super Administrator.
2. He accepts; he can then manage DNS, the /storage/* cache rule, WAF rules and R2.
3. Billing (R2 usage) is account-level: update payment info under Manage Account -> Billing.
4. True ownership = the account email itself. If this Cloudflare account contains
   nothing else of Dev's, change the account email to Shivam's under My Profile.
   Only move the zone to a brand-new account as a last resort; that requires
   re-creating DNS (export BIND file first), the /storage/* cache rule, WAF rules,
   copying the R2 bucket, and re-pointing nameservers at GoDaddy.

### 6. Domain (registrar: GoDaddy, expires 2027-05-15)
1. Easiest: GoDaddy account change (free, instant, keeps nameservers).
   dcc.godaddy.com -> foodpharmer.health -> Transfer to another GoDaddy account ->
   enter Shivam's email; he accepts under Domains -> Transfers -> Incoming in his
   GoDaddy account.
2. Nameservers stay huxley/pola.ns.cloudflare.com. Do not change them.
3. Alternative (slower, ~5 days): unlock + EPP code, transfer out to his preferred
   registrar.

### 7. Hostinger mailbox (hello@foodpharmer.net)
1. Share the mailbox password over the secure channel. SMTP is smtp.hostinger.com:465,
   user hello@foodpharmer.net (already in Vercel env).
2. He changes the password (hpanel.hostinger.com -> Emails -> foodpharmer.net).
3. IMMEDIATELY update SMTP_PASS in all three secret stores, or oil-board and
   founder-notify emails break.
4. Check whether the same Hostinger account controls the foodpharmer.net domain/DNS
   (MX records); if so, include the account itself in the handover.

### 8. Google Search Console + GCP indexer
1. search.google.com/search-console -> foodpharmer.health -> Settings -> Users and
   permissions -> Add shivamagwl02@gmail.com as Owner.
2. He should also add his own verification (DNS TXT via Cloudflare) so ownership
   survives Dev's removal.
3. GCP project with the `gsc-indexer` service account: IAM -> Grant access ->
   shivamagwl02@gmail.com -> Owner. He mints a fresh SA key (Service Accounts ->
   gsc-indexer -> Keys -> Add key) and Dev deletes the old one.

### 9. Microsoft Clarity
1. clarity.microsoft.com -> project -> Settings -> Team -> add shivamagwl02@gmail.com
   as Admin.
2. He generates his own API token (Settings -> Data Export) and replaces the
   CLARITY_API_TOKEN Actions secret; delete Dev's token.

### 10. Secrets handover + rotation (last)
Hand over `.env.local` once, then rotate everything on the list below. Every rotated
value must be updated in all three stores: his `.env.local`, Vercel project env vars
(production + preview), and GitHub Actions secrets.
- Supabase API keys (Project Settings -> API): legacy JWT rotation changes anon +
  service-role together, so redeploy immediately after.
- Supabase DB password (Project Settings -> Database -> reset) -> SUPABASE_DB_PASSWORD secret.
- Vercel token: he creates his own at vercel.com/account/tokens -> VERCEL_TOKEN secret;
  Dev deletes the old token.
- Cloudflare API token + R2 keys: he creates new, Dev revokes old.
- SMTP password (step 7). CONTACT_EXPORT_TOKEN: any new random string.

### 11. Verify the handover
- Shivam: push to staging fires a preview deploy; /admin login works with reviewer
  actions visible; can run a workflow manually in Actions; receives the weekly
  clarity digest (follows repo owner).
- Site email works after SMTP rotation: submit /oil-board with a test address.
- One deliberate prod deploy under his ownership (staging -> master) + Cloudflare purge.

## Secrets inventory

All runtime secrets live in three places, never in git:

1. `.env.local` on the dev machine (hand over securely, then ROTATE everything):
   Supabase URL/anon/service-role/DB password/access token, Vercel token,
   CONTACT_EXPORT_TOKEN, Clarity API token, SMTP host/user/pass, Cloudflare API token +
   account + zone id, R2 access keys.
2. Vercel project env vars (production + preview) - same Supabase/SMTP set.
3. GitHub Actions repo secrets - Clarity token, Google SA JSON, Supabase keys, Vercel token.

After Dev's access ends, rotate: Supabase service-role key and DB password, Vercel token,
Cloudflare API token, R2 keys, SMTP password, CONTACT_EXPORT_TOKEN. Update the rotated
values in all three places above.

## Standing rules (do not break these)

- Push to `staging` only. `master` is production; deploy to it only deliberately, and
  purge the Cloudflare cache after every prod deploy (purge command is documented in
  `.env.local` comments).
- Cost guards are deliberate: Cloudflare cache rule on /storage/* absorbs Supabase
  egress; page and OG-image cache headers in `next.config.ts` and
  `app/c/[category]/[slug]/opengraph-image.tsx` keep Vercel compute low. Do not remove
  them. Target is under $25/mo across Vercel + Supabase.
- Copy rules for anything user-visible: never the words "healthier" or "cleaner"
  (brand line is "Better for You by Food Pharmer"), and no em dashes anywhere.
- This is a customized Next.js build. Read `node_modules/next/dist/docs/` before
  writing framework-level code (see AGENTS.md).
- sharp is pinned to 0.34.5 on purpose (must match Next's nested copy; a second libvips
  crashes the OG image route). `serverExternalPackages: ["sharp"]` in next.config.ts is
  part of the same fix.

## Scheduled automation (GitHub Actions in this repo)

- `clarity-digest.yml` - weekly analytics digest; surfaces as a notification to the repo
  owner, so it follows the repo transfer automatically.
- `monitor-usage.yml` - usage guardrail checks.
- `push-broadcast.yml` / `push-digest.yml` - mobile push sending (dormant; blocked on
  Firebase keys that were never provided).

## In flight at handover (2026-07-16)

- Founder notification feature (congrats email on first push-Live + per-product OG share
  card) is complete on `staging`, not yet on prod. Founder emails are entered at
  /admin/brands; most are still empty. Source for backfill: Harsh's brand-submissions
  Google Sheet.
- Oil Board lead magnet (/oil-board) is live on prod.
- Backlog: em-dash sweep of restaurant-vertical DB copy; product
  `taakat-hunger-bar-crunchy-coconut` has mismatched name "Hunger Bar Almond Delight" in
  the DB; UX audit backlog (CTA rename, homepage value prop, search ranking).
- Capacitor mobile app (health.foodpharmer.app) has a push foundation built but dormant;
  see docs/play-store-kit.md.
