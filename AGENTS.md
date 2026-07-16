<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Standing rules (do not break these)

Full handover context and account inventory: `docs/HANDOVER.md`.

- **Branches:** push to `staging` only. `master` is production and deploys
  foodpharmer.health; merge `staging` into `master` only when the operator explicitly
  asks for a prod push, and purge the Cloudflare cache after every prod deploy.
- **Commits:** commit and push each edit immediately after making it. Never batch
  changes, never `git add -A`; stage the specific files you touched.
- **Copy rules for anything user-visible** (pages, emails, OG cards, DB copy):
  - Never the words "healthier" or "cleaner". The brand line is
    "Better for You by Food Pharmer".
  - No em dashes anywhere. Use a period, comma, or parentheses instead.
- **Cost guards are deliberate, do not remove:** the Cloudflare cache rule on
  `/storage/*` (absorbs Supabase egress), the WAF scraper rules, and the cache headers
  in `next.config.ts` and the OG image routes. Budget target is under $25/mo across
  Vercel + Supabase.
- **sharp is pinned to 0.34.5** and listed in `serverExternalPackages` in
  `next.config.ts` on purpose (a second libvips copy crashes the OG image route).
  Do not upgrade or unpin it.
- **Secrets** live only in `.env.local`, Vercel env vars, and GitHub Actions secrets.
  Never commit, print, or echo secret values.
<!-- END:nextjs-agent-rules -->
