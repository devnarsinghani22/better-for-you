# Play Store submission kit — Better for You

Everything needed to publish `health.foodpharmer.app`. Internal testing needs
only the AAB + Data Safety + content rating; the rest is for Production.

AAB to upload: `mobile/android/app/build/outputs/bundle/release/app-release.aab`
(versionCode 1 — first upload, no bump needed).

---

## App name (display + store title)

Primary recommendation (matches the website brand):
- **Title (max 30 chars):** `Better for You by Food Pharmer` (exactly 30)
- Alternatives if renaming: `Food Pharmer Approved` (21) · `Better for You — Food Pharmer` (29)

Whatever you pick is the *display name* only. The package id stays
`health.foodpharmer.app` forever. To change the on-device name, it's one line in
`mobile/android/app/src/main/res/values/strings.xml` (`app_name` +
`title_activity_main`) then a rebuild — tell me and I'll do it.

---

## Short description (max 80 chars)

> Label-checked food & drinks, shortlisted by Food Pharmer. Never sponsored.

(74 chars.)

---

## Full description (paste into Play Console)

> **Food that's actually better for you — checked, not sponsored.**
>
> Better for You is Food Pharmer's running shortlist of packaged foods and
> drinks that pass a real ingredient-and-label check. No brand pays to be on
> this list. If it's here, it earned its place.
>
> **What you get**
> • A curated catalogue of approved products — biscuits, peanut butter, paneer,
>   noodles, makhana, oats, ORS and more — across clear categories.
> • The actual reason each product made the cut: we read the ingredient list and
>   the printed nutrition label, and we show you what we found.
> • The real nutrition label from the pack — not a retyped version — so you can
>   trust what you're reading.
> • Fast search to check whether something you're about to buy is on the list.
> • Buy links so you can order the approved pick directly.
>
> **How we decide**
> We look past front-of-pack marketing and read the ingredients and nutrition
> the way a label-literate shopper would. Our criteria are published in the app
> so you can see exactly how a product qualifies — and why others don't.
>
> **Not sponsored. Ever.**
> Brands cannot pay to appear. This is an independent, editorial shortlist from
> Food Pharmer — built to save you time and help you shop with confidence.
>
> Turn on notifications and we'll let you know when a new product is approved.

*(Phrasing deliberately leads with the curation/criteria/label utility — that's
what distinguishes this from "just a website" under Play's Minimum Functionality
policy. Keep it.)*

---

## Data Safety form (answer exactly)

**Does your app collect or share any of the required user data types?** → **Yes**

| Data type | Collected | Shared | Purpose | Notes |
|---|---|---|---|---|
| Name | Yes | No | App functionality; Account management | Only if user fills a launch/notify-me form |
| Email address | Yes | No | App functionality; Account management | same |
| Phone number | Yes | No | App functionality | same |
| Device or other IDs | Yes | No | App functionality (push notifications) | FCM push token |
| App activity (app interactions, other user-generated content) | Yes | Yes | Analytics | Microsoft Clarity (processor) |
| App info & performance (diagnostics) | Yes | Yes | Analytics | Microsoft Clarity |

Other answers:
- **Is all data encrypted in transit?** → **Yes** (everything is HTTPS).
- **Do you provide a way for users to request data deletion?** → **Yes** —
  deletion-request email in the privacy policy.
- **Is data collection required or optional?** Name/email/phone = optional (only
  via forms). Analytics = collected automatically.
- **Privacy policy URL:** `https://foodpharmer.health/privacy`

> "Shared = Yes" for the Clarity rows because data goes to Microsoft as an
> analytics processor. If you'd rather not mark Shared, the conservative-but-
> still-accurate alternative is to disable Clarity in the app's WebView — say
> the word and I'll gate Clarity to web-only.

---

## Content rating (IARC questionnaire)

Category: **Reference, News, or Educational** (or "Shopping").
- Violence / scary content: **No**
- Sexual content / nudity: **No**
- Profanity / crude humour: **No**
- Controlled substances (drugs/alcohol/tobacco): **No**
- Gambling / simulated gambling: **No**
- User-generated content / user interaction / sharing: **No** (the app shows our
  catalogue; users don't post)
- Shares user location: **No**
- Digital purchases: **No**

Expected result: **Everyone / 3+ (PEGI 3 / ESRB Everyone)**.

## Target audience & content
- **Target age group:** 18 and over (it's a grocery/shopping reference app, not
  directed at children — keeps you out of the Families policy).
- **Ads:** **No, my app does not contain ads.**
- **App access:** All functionality is available without a login → choose "All
  functionality is available without special access."

---

## Step-by-step (Play Console)

1. **Create app** → name (above), Default language English (India), App, Free.
2. **App content** (left nav) → complete: Privacy policy URL, Ads (No), App
   access (no login), Content rating (questionnaire above), Target audience (18+),
   Data safety (table above), Government apps (No), Financial features (None),
   Health (it's general info — declare "no health functionalities" / N/A).
3. **Testing → Internal testing → Create release** → upload `app-release.aab` →
   add yourself + team as testers → Save → Review → Start rollout.
4. Open the **opt-in link** Play gives you, install on your phone, allow
   notifications. (Your token will appear in the `push_tokens` table.)
5. When happy: **Production → Create release**, add the store listing (short +
   full description above) + graphics (in `mobile/store-assets/`), and roll out.
