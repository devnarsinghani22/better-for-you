# PWA Installable + Offline (v1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make foodpharmer.health installable to the home screen on iOS + Android with offline support, reusing 100% of the existing frontend and Supabase backend.

**Architecture:** Hand-rolled service worker (no Next-PWA plugin — avoids breaking the forked Next.js 16) + Next's `app/manifest.ts` convention + generated PNG icons. Cache-first for immutable Supabase Storage images and `_next/static`, stale-while-revalidate for HTML navigations with a branded offline fallback.

**Tech Stack:** Next.js 16 (modified), React 19, Tailwind v4, vanilla Service Worker API, Cache Storage API. Icons generated with Python Pillow.

**Verification note:** Service workers, manifests, and icons are not meaningfully unit-testable and the project does not want unsolicited unit tests. Each task verifies via build + real runtime checks (curl, DevTools, Lighthouse, device install).

**Spec:** `docs/superpowers/specs/2026-05-26-pwa-installable-offline-design.md`

**Working directory:** `/c/Users/devna/foodpharmer-approved` (folder rename to `better-for-you` is pending a file-lock release; paths here use the current name). Work on the `staging` branch; deploy via the existing prod pipeline at the end.

---

### Task 1: Generate app icons

**Files:**
- Create: `tools/make_icons.py`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-192-maskable.png`, `public/icons/icon-512-maskable.png`
- Create: `app/apple-icon.png` (Next auto-emits the `apple-touch-icon` link for this convention file)

The source mark (`app/icon.svg`) is a black square with a white rounded checkmark: viewBox `0 0 64 64`, path `M14 34 L26 46 L50 22`, stroke width 6, round caps/joins. We redraw it with Pillow at each size (no SVG rasterizer dependency). Maskable variants shrink the check to ~66% so it stays inside Android's safe zone; background stays full-bleed black.

- [ ] **Step 1: Write the icon generator**

```python
# tools/make_icons.py
from PIL import Image, ImageDraw
import os

OUT_ICONS = "public/icons"
os.makedirs(OUT_ICONS, exist_ok=True)

# Source geometry in a 64x64 viewBox
PTS = [(14, 34), (26, 46), (50, 22)]
STROKE = 6
CENTER = 32.0

def render(size: int, content_scale: float) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 255))  # full-bleed black
    d = ImageDraw.Draw(img)
    f = size / 64.0
    def tx(p):
        x = CENTER + (p[0] - CENTER) * content_scale
        y = CENTER + (p[1] - CENTER) * content_scale
        return (x * f, y * f)
    pts = [tx(p) for p in PTS]
    w = max(1, round(STROKE * f * content_scale))
    d.line(pts, fill=(255, 255, 255, 255), width=w, joint="curve")
    r = w / 2.0
    for (x, y) in (pts[0], pts[-1]):  # round end caps
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 255))
    return img

# Standard icons (purpose "any") — full-size check
render(192, 1.0).save(f"{OUT_ICONS}/icon-192.png")
render(512, 1.0).save(f"{OUT_ICONS}/icon-512.png")
# Maskable — check pulled into the safe zone
render(192, 0.66).save(f"{OUT_ICONS}/icon-192-maskable.png")
render(512, 0.66).save(f"{OUT_ICONS}/icon-512-maskable.png")
# Apple touch icon (180) — full-size check
render(180, 1.0).save("app/apple-icon.png")
print("icons written")
```

- [ ] **Step 2: Run it (use a Python that has Pillow — the rembg venv does)**

Run:
```bash
cd /c/Users/devna/foodpharmer-approved
tools/.venv-rembg/Scripts/python.exe tools/make_icons.py || python3 tools/make_icons.py
```
Expected: `icons written`, and 5 PNG files exist.

- [ ] **Step 3: Verify the files**

Run: `ls -l public/icons/ app/apple-icon.png`
Expected: `icon-192.png`, `icon-512.png`, `icon-192-maskable.png`, `icon-512-maskable.png`, `app/apple-icon.png` all present and non-zero. Open `icon-512.png` to eyeball: black square, centered white check.

- [ ] **Step 4: Commit**

```bash
git add tools/make_icons.py public/icons app/apple-icon.png
git commit -m "feat(pwa): generate app + maskable + apple icons from brand mark"
```

---

### Task 2: Web app manifest

**Files:**
- Create: `app/manifest.ts`

Next serves this at `/manifest.webmanifest` and auto-injects `<link rel="manifest">`. No registration needed.

- [ ] **Step 1: Create the manifest route**

```typescript
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Better for You by Food Pharmer",
    short_name: "Better for You",
    description:
      "Packaged foods we'd actually buy — label-checked by Food Pharmer.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
```

- [ ] **Step 2: Build to confirm the route compiles**

Run: `npm run build 2>&1 | grep -iE "manifest|error" | head`
Expected: build lists `/manifest.webmanifest` as a route; no errors.

- [ ] **Step 3: Verify it serves locally**

Run:
```bash
npm run start &  # or `npm run dev`
sleep 4
curl -s http://localhost:3000/manifest.webmanifest
```
Expected: JSON with `name`, `display: "standalone"`, and the 4 icons. (Stop the server after.)

**Fallback (only if the `app/manifest.ts` route 404s or errors on the fork):** delete it, create `public/manifest.webmanifest` with the same JSON, and add `manifest: "/manifest.webmanifest"` to the `metadata` export in `app/layout.tsx`.

- [ ] **Step 4: Commit**

```bash
git add app/manifest.ts
git commit -m "feat(pwa): add web app manifest"
```

---

### Task 3: Offline fallback page

**Files:**
- Create: `app/offline/page.tsx`

Must render with **no Supabase calls** so it works fully offline and is cheap to cache.

- [ ] **Step 1: Create the offline page**

```tsx
// app/offline/page.tsx
export const dynamic = "force-static";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[color:var(--bg)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)]">
        Better for You · by Food Pharmer
      </p>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl tracking-[-0.02em] text-[color:var(--ink)]">
        You&rsquo;re offline
      </h1>
      <p className="mt-3 max-w-sm text-[color:var(--ink-soft)] leading-relaxed">
        Pages and products you&rsquo;ve already opened still work. Reconnect to
        browse the rest of the list.
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Build to confirm it's a static route**

Run: `npm run build 2>&1 | grep -E "/offline|error" | head`
Expected: `/offline` listed as static (`○`); no errors.

- [ ] **Step 3: Commit**

```bash
git add app/offline/page.tsx
git commit -m "feat(pwa): add branded offline fallback page"
```

---

### Task 4: Service worker

**Files:**
- Create: `public/sw.js`

Served at `/sw.js` (same origin, root scope). Versioned caches; cache-first for immutable images + hashed static; stale-while-revalidate for HTML; offline fallback for failed navigations. Does **not** call `skipWaiting()` (new SW activates on next launch).

- [ ] **Step 1: Create the service worker**

```javascript
// public/sw.js
const VERSION = "v1";
const STATIC_CACHE = `bfy-static-${VERSION}`;
const IMG_CACHE = `bfy-images-${VERSION}`;
const PAGE_CACHE = `bfy-pages-${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {})
  );
  // Intentionally no skipWaiting(): the new SW takes over on next launch.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = [STATIC_CACHE, IMG_CACHE, PAGE_CACHE];
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

function isStorageImage(url) {
  return (
    url.hostname.endsWith(".supabase.co") &&
    url.pathname.includes("/storage/v1/object/public/")
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // 1) Supabase Storage images — cache-first (immutable; cuts egress)
  if (isStorageImage(url)) {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return hit || Response.error();
        }
      })
    );
    return;
  }

  // 2) Next hashed static assets — cache-first
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // 3) HTML navigations — stale-while-revalidate, offline fallback
  if (req.mode === "navigate") {
    event.respondWith(
      caches.open(PAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => null);
        event.waitUntil(network); // keep revalidation alive
        return cached || (await network) || (await caches.match(OFFLINE_URL));
      })
    );
    return;
  }

  // 4) Everything else (Supabase REST, /api/search): passthrough to network (fresh data)
});
```

- [ ] **Step 2: Verify it serves from root**

Run:
```bash
npm run build && npm run start &
sleep 4
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:3000/sw.js
```
Expected: `200 text/javascript` (or `application/javascript`). Stop the server.

- [ ] **Step 3: Commit**

```bash
git add public/sw.js
git commit -m "feat(pwa): add service worker (cache-first images, SWR pages, offline)"
```

---

### Task 5: Register the SW + iOS metadata

**Files:**
- Create: `components/ServiceWorkerRegister.tsx`
- Modify: `app/layout.tsx` (import + mount the component; add `appleWebApp` to metadata; add `viewport` themeColor)

- [ ] **Step 1: Create the registration component**

```tsx
// components/ServiceWorkerRegister.tsx
"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
```

- [ ] **Step 2: Add `appleWebApp` to the metadata export in `app/layout.tsx`**

Insert into the `metadata` object (e.g. after the `twitter` block, before the closing `}`):

```typescript
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Better for You",
  },
```

- [ ] **Step 3: Add a `viewport` export to `app/layout.tsx`**

Add `Viewport` to the type import and export the viewport (place near the `metadata` export):

```typescript
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#000000",
};
```
(Update the existing `import type { Metadata } from "next";` line to include `Viewport`.)

- [ ] **Step 4: Mount the component in `app/layout.tsx`**

Add the import with the other imports:
```typescript
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
```
Then render it inside `<body>`, alongside `<Analytics />`:
```tsx
        {children}
        <ServiceWorkerRegister />
        <Analytics />
```

- [ ] **Step 5: Build to confirm everything compiles**

Run: `npm run build 2>&1 | tail -5`
Expected: exit 0, route table printed, no type errors.

- [ ] **Step 6: Commit**

```bash
git add components/ServiceWorkerRegister.tsx app/layout.tsx
git commit -m "feat(pwa): register service worker + iOS web-app metadata"
```

---

### Task 6: Local verification + deploy

**Files:** none (verification + deploy only)

- [ ] **Step 1: Production build + serve locally**

Run:
```bash
npm run build && npm run start
```
Expected: server on http://localhost:3000, build clean.

- [ ] **Step 2: DevTools checks (Chrome)**

Open http://localhost:3000 → DevTools → Application:
- Manifest: name, icons, `standalone` all present, no errors.
- Service Workers: `/sw.js` is **activated and running**.
- Cache Storage: `bfy-static-v1` populated after a reload; `bfy-images-v1` populates after viewing product images.

- [ ] **Step 3: Offline test**

DevTools → Network → check "Offline". Reload a page you already visited → it renders. Navigate to a never-visited route → the **/offline** page renders (not the browser dino).

- [ ] **Step 4: Lighthouse**

DevTools → Lighthouse → category "Progressive Web App" (or Installability) → run.
Expected: **Installable = pass**; no manifest/SW errors. (Stop the local server after.)

- [ ] **Step 5: Deploy to staging, then prod**

```bash
# staging
git push origin staging

# prod pipeline (stash staging-only robots override, rebuild master from origin, merge, verify, build, push)
git stash push -- app/robots.ts
git fetch origin master
git checkout -B master origin/master
git merge -X theirs staging
git diff staging HEAD --stat   # MUST be empty
npm run build
git push origin master
git checkout staging
git stash pop
```
Then poll Vercel for the `target=production` deploy to reach READY at the new master SHA.

- [ ] **Step 6: Real-device install check**

- Android Chrome → visit foodpharmer.health → menu shows **Install app** (or an install prompt) → installs with the check icon + "Better for You" name, launches fullscreen.
- iPhone Safari → Share → **Add to Home Screen** → correct icon + name; opens fullscreen (no Safari chrome).

---

## Self-review

- **Spec coverage:** manifest (T2), icons incl. maskable + apple (T1), service worker with the 4 caching strategies + offline fallback (T3, T4), SW registration + iOS metadata (T5), verification incl. Lighthouse + device install + deploy (T6). All spec components covered.
- **Out of scope confirmed absent:** no push, no TWA/Play Store, no admin changes, no native code.
- **Type/path consistency:** manifest icon `src` paths (`/icons/icon-*.png`) match the files written in T1; `OFFLINE_URL = "/offline"` matches the route created in T3; `ServiceWorkerRegister` import path matches the file in T5.
- **Egress alignment:** cache-first on immutable Storage images (T4) reduces Supabase egress for returning/installed users.
