# PWA — Installable + Offline (v1) — Design Spec

**Date:** 2026-05-26
**Scope:** Convert the existing site (foodpharmer.health) into an installable, offline-capable Progressive Web App. No native rewrite, no app-store work, no new paid services. $0 marginal cost.

## Goal

Make "Better for You by Food Pharmer" installable to the home screen on iOS and Android, with offline support, reusing 100% of the existing Next.js frontend and Supabase backend. This is v1 of a larger app effort; push notifications and a Play Store (TWA) listing are explicit fast-follows, **not** in this scope.

## Context & constraints

- Stack: **modified Next.js 16** ("This is NOT the Next.js you know" — `AGENTS.md`), React 19, Tailwind v4, Supabase, Vercel.
- `next.config.ts` already edge-caches HTML (`s-maxage`) to keep traffic off Supabase.
- Storage images now carry `Cache-Control: public, max-age=31536000, immutable` (from the egress fix) — ideal for aggressive, safe client caching.
- Brand: white background (`#ffffff`), black ink (`#000000`), light color-scheme. Existing favicon `app/icon.svg` = black square + white checkmark.
- No PWA scaffolding currently exists (no manifest, no service worker).

## Approach decision

**Hand-rolled service worker + Next's manifest convention.** Rejected `@ducanh2912/next-pwa` and Serwist because both hook the webpack/build config — the exact surface that breaks against the forked Next.js. Our caching needs are simple (immutable images → cache-first; HTML → stale-while-revalidate), so a ~100-line vanilla service worker is lower-risk and fully owned.

## Components

### 1. `app/manifest.ts`
Next `MetadataRoute.Manifest`:
- `name`: "Better for You by Food Pharmer"
- `short_name`: "Better for You"
- `description`: short tagline ("Packaged foods we'd actually buy, label-checked by Food Pharmer.")
- `start_url`: `/`
- `display`: `standalone`
- `background_color`: `#ffffff`
- `theme_color`: `#000000`
- `icons`: 192 + 512 (any) and 192 + 512 (maskable)

Fallback: if the `app/manifest.ts` route convention misbehaves on the fork, ship a static `public/manifest.webmanifest` + `<link rel="manifest">` instead.

### 2. Icons
Rasterize `app/icon.svg` (black square + white check) to PNG:
- `public/icons/icon-192.png`, `icon-512.png` (purpose `any`)
- `public/icons/icon-192-maskable.png`, `icon-512-maskable.png` (extra safe-zone padding so the check isn't clipped by circular/squircle masks)
- `public/apple-touch-icon.png` (180×180)

Rasterization via a Node `sharp` or Python (PIL/cairosvg/resvg) one-off; the rembg venv is available locally. Icons are committed as static assets (not generated at build time) to avoid adding a build dependency.

### 3. `public/sw.js` (service worker)
Versioned cache names (`bfy-static-v1`, `bfy-images-v1`, `bfy-pages-v1`). Fetch router:

| Request | Strategy | Rationale |
|---|---|---|
| Supabase Storage images (`*.supabase.co/storage/v1/object/public/*`) | **cache-first** | Immutable; installed users re-download ~never → further cuts Supabase egress |
| `/_next/static/*` (hashed) | cache-first | Content-hashed, immutable |
| HTML navigations (`mode: navigate`) | **stale-while-revalidate**; offline → offline page | Matches existing edge-cache philosophy; instant loads, background refresh |
| Supabase REST / `/api/search` | network-first, short/no cache | Keep data fresh; don't serve stale catalog |
| everything else | passthrough (network) | — |

- `install`: precache the offline page + core icons; `self.skipWaiting()` is **not** called automatically — new SW activates on next launch to avoid mid-session disruption.
- `activate`: delete caches whose names don't match the current version; `clients.claim()`.

### 4. `components/ServiceWorkerRegister.tsx`
Client component (`'use client'`), `useEffect` registers `/sw.js` (guarded by `'serviceWorker' in navigator` and production-only). Mounted once in `app/layout.tsx`.

### 5. `app/offline/page.tsx`
Branded "You're offline" fallback page (cached at install), shown when a navigation request fails and the target isn't cached.

### 6. Apple / iOS metadata (in `app/layout.tsx` metadata)
- `appleWebApp`: `{ capable: true, statusBarStyle: 'default', title: 'Better for You' }`
- `apple-touch-icon` link → `public/apple-touch-icon.png`
- Ensures iOS "Add to Home Screen" shows the right name, icon, and fullscreen chrome.

## Data flow

1. First visit (browser): page loads normally from Vercel edge; SW registers in the background.
2. SW caches the app shell, static assets, and images as they're fetched.
3. Repeat visits / installed app: images + static assets served from cache (no network); HTML served stale-while-revalidate (instant, refreshed in background).
4. Offline: cached pages/images load; uncached navigations show the offline page.
5. New deploy: SW's revalidate fetches fresh HTML; on next launch the new SW version activates and purges old caches.

## Out of scope (fast-follows, separate specs)

- **Web push notifications** (VAPID keys, subscription storage in Supabase, send trigger; iOS requires install-first).
- **Android Play Store listing** via TWA / Bubblewrap ($25 one-time).
- Native rewrite (React Native / Expo).
- Any change to the `/admin` panel (stays web-only, not part of the installable experience).

## Egress note

This *reduces* Supabase load: a service worker doing cache-first on immutable Storage images means installed/returning users stop re-fetching images entirely — reinforcing the recent cache-control egress fix rather than adding to it. New first-time loads are the only image egress.

## Verification

- Lighthouse PWA audit → installable: **pass**.
- DevTools → Application: manifest parses, SW is **activated**, caches populate.
- DevTools offline mode → previously-visited pages + images still render; uncached route → offline page.
- Real-device install: Android Chrome → "Install app"; iPhone Safari → "Add to Home Screen" → correct icon/name/fullscreen.
- Confirm a new deploy propagates (visit, reload, see updated content within one launch cycle).

## Deploy

Staging branch → existing prod pipeline (stash robots → merge to master → build → push → poll Vercel). No DB changes, no new env vars, no new services.
