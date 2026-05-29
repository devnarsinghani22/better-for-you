# iOS Release Handoff — Better for You

Everything needed to build, sign, and ship the iOS app on a Mac. The Android
version is already live in testing; this is the iOS twin of the same app.

**What the app is:** a Capacitor app that loads the live website
`https://foodpharmer.health` in a fullscreen native WebView. There are no
bundled web pages, so content updates with the website. Bundle ID:
`health.foodpharmer.app`. Display name: **Better for You by Food Pharmer**.

Work top to bottom. **Part A gets the app onto TestFlight. Part B adds push
notifications** (do Part A first, confirm it runs, then Part B).

---

## IMPORTANT: pull the latest before building

If you cloned earlier, run `git pull` first. Recent fixes that the iOS build
must include:
- **Back button / `@capacitor/app` plugin** — already in `package.json`, so
  `npm install` + `npx cap sync ios` pick it up automatically. (On iOS there's
  no hardware back button; the handler is a harmless no-op. iOS uses the
  WebView's swipe-back gesture.)
- **Native-feel polish + page cross-fade transitions** — these are *web-side*
  (already live on foodpharmer.health). Because the app loads the live site,
  the iOS app gets them automatically on launch. No iOS code needed. The
  `html.capacitor-native` class is set via `@capacitor/core` (present in every
  build), so the tap-feedback/no-callout polish applies in the WKWebView too.
- **Push** — still Part B below (needs the Firebase Messaging step).

Net: just pull latest, `npm install`, `npx cap sync ios`, and everything except
push works automatically. Don't add anything special for back button or
animations on iOS.

## Prerequisites on the Mac
- **Xcode** (latest from the App Store)
- **CocoaPods**: `sudo gem install cocoapods` (or `brew install cocoapods`)
- **Node.js 18+** and npm
- **Git access** to the repo: `github.com/devnarsinghani22/better-for-you`
- **Apple Developer Program** access (the Team) — already enrolled

You also need two things created in consoles (Part 1 + Part 2 below). They can
be done from any machine, including Windows, before touching the Mac.

---

## Part 1 — Firebase iOS app (5 min, any machine)
Push uses the same Firebase project as Android (`better-for-you-14669`).
1. Firebase console -> project **better-for-you-14669** -> Add app -> **iOS**.
2. Apple bundle ID: `health.foodpharmer.app` (exact). Nickname: "Better for You (iOS)".
3. Download **`GoogleService-Info.plist`**. Keep it for step A4.
4. Skip the SDK/CocoaPods instructions Firebase shows — handled below.

## Part 2 — APNs key for push (10 min, any machine) [needed for Part B]
1. Apple Developer -> Certificates, Identifiers & Profiles -> **Keys** -> **+**.
2. Enable **Apple Push Notifications service (APNs)** -> Continue -> Register.
3. **Download the `.p8` file — you can only download it once.** Note the **Key ID**.
4. Note your **Team ID** (top-right of the Apple Developer site).
5. Firebase console -> Project settings -> **Cloud Messaging** -> Apple app ->
   **APNs Authentication Key** -> upload the `.p8` + Key ID + Team ID.
   This is what lets our existing sender deliver to iPhones.

---

# PART A — Build and ship to TestFlight

### A1. Get the project
```
git clone https://github.com/devnarsinghani22/better-for-you.git
cd better-for-you/mobile
npm install
```

### A2. Sync the iOS project (installs pods + plugins)
```
npx cap sync ios
```
This copies config and installs CocoaPods for the plugins
(`@capacitor/push-notifications`, `@capacitor/splash-screen`).

### A3. Generate app icon + splash for iOS
```
npx @capacitor/assets generate --ios
```
Uses `mobile/assets/icon.png` and `mobile/assets/splash.png` (already in the
repo) to fill `ios/App/App/Assets.xcassets`.

### A4. Add the Firebase config file
- Copy **`GoogleService-Info.plist`** (from Part 1) into `mobile/ios/App/App/`.
- Open `mobile/ios/App/App.xcworkspace` in Xcode (the **.xcworkspace**, not .xcodeproj).
- Drag `GoogleService-Info.plist` into the **App** group in Xcode ->
  check **Copy items if needed** and add it to the **App** target.

### A5. Signing
- Select the **App** target -> **Signing & Capabilities**.
- **Team**: select the Apple Developer team.
- **Bundle Identifier**: `health.foodpharmer.app`.
- **Automatically manage signing**: ON. Let it create the provisioning profile.

### A6. Version
- App target -> **General** -> Version `1.0`, Build `1`.

### A7. Archive and upload
- Top device selector -> **Any iOS Device (arm64)**.
- Menu -> **Product -> Archive**.
- When the Organizer opens -> **Distribute App -> App Store Connect -> Upload**.
- Accept the automatic-signing prompts.

### A8. App Store Connect
- appstoreconnect.apple.com -> **My Apps -> + -> New App**.
  - Platform iOS, Name **Better for You by Food Pharmer**, bundle
    `health.foodpharmer.app`, primary language English (India), SKU
    `betterforyou-ios`.
- The uploaded build appears under **TestFlight** after ~5-15 min of processing.
- TestFlight -> add yourself / team as internal testers -> install the
  **TestFlight** app on the iPhone and accept the invite.

**At this point the app runs on iPhones via TestFlight.** Confirm it loads
foodpharmer.health and behaves like the Android app, then do Part B.

---

# PART B — Enable iOS push notifications

Goal: the iPhone must produce an **FCM token** (not a raw APNs token), because
our sender (`tools/push_send.py`) and GitHub workflows send via Firebase Cloud
Messaging. On Android this is automatic; on iOS it needs the Firebase Messaging
SDK wired into the app.

### B1. Capabilities (Xcode)
- App target -> **Signing & Capabilities -> + Capability**:
  - **Push Notifications**
  - **Background Modes** -> tick **Remote notifications**

### B2. Add Firebase Messaging
- In `mobile/ios/App/Podfile`, inside `target 'App'`, add:
  ```
  pod 'FirebaseMessaging'
  ```
- From `mobile/ios/App/`: `pod install`

### B3. AppDelegate
In `mobile/ios/App/App/AppDelegate.swift`:
- At the top: `import FirebaseCore` and `import FirebaseMessaging`.
- In `application(_:didFinishLaunchingWithOptions:)`, before `return true`:
  `FirebaseApp.configure()`
- Add so the APNs token is handed to Firebase (this makes the Capacitor push
  plugin's `registration` event return the FCM token):
  ```swift
  func application(_ application: UIApplication,
      didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
      Messaging.messaging().apnsToken = deviceToken
  }
  ```
> Verify against the current Capacitor push-notifications iOS guide
> (capacitorjs.com/docs/apis/push-notifications#ios) since SDK details shift.
> The web side already posts whatever token the `registration` event returns to
> `/api/push/register`, so once that token is the FCM token, iOS push just works
> with no further changes on our side.

### B4. Test
- Rebuild and run on a real iPhone (push does not work in the simulator).
- Allow notifications -> a row should appear in the `push_tokens` table with
  `platform = ios`.
- Trigger a test: GitHub repo -> Actions -> **push-broadcast** -> Run workflow.

---

# Going public on the App Store (after TestFlight looks good)

- **App icon**: 1024x1024 PNG, no alpha/transparency — use `mobile/assets/icon.png`.
- **Screenshots** (iOS sizes differ from Android): you need 6.7" iPhone
  (1290x2796) and 6.5" (1284x2778). Capture from a device/simulator, or ask the
  Windows side to generate them from the live site at those dimensions.
- **Description**: reuse the text in `docs/play-store-kit.md` (the checkmark-
  bulleted full description works as-is).
- **App Privacy** questionnaire (Apple's version of Play Data Safety) — answers
  below.
- Submit for review. Apple review is typically 24-48h.

### App Privacy answers (mirror of the Play Data Safety we already filed)
- **Does the app collect data?** Yes.
- **Contact Info** -> Name, Email, Phone: collected, **Not linked** to identity
  (no accounts), used for **App Functionality** + **Developer's communications**.
  **Not used for tracking.**
- **Identifiers** -> Device ID (push token): App Functionality. Not tracking.
- **Usage Data** -> Product Interaction + search history (Clarity + our logging):
  Analytics. Not tracking.
- **Diagnostics**: Analytics.
- **"Used to track you across apps/websites?"** -> **No** (we run analytics for
  ourselves; we do not sell data or share for cross-app ad tracking).
- Privacy policy URL: `https://foodpharmer.health/privacy`

---

## Quick checklist
- [ ] Part 1: Firebase iOS app added, GoogleService-Info.plist downloaded
- [ ] Part 2: APNs .p8 created + uploaded to Firebase
- [ ] A1-A2: repo pulled, `npm install`, `npx cap sync ios`
- [ ] A3: icons/splash generated
- [ ] A4: GoogleService-Info.plist added to Xcode App target
- [ ] A5-A6: signing set, version 1.0 / build 1
- [ ] A7-A8: archived, uploaded, app record created, build in TestFlight
- [ ] B1-B4: push capability + Firebase Messaging wired, token lands in DB
- [ ] App Store listing + privacy answers + submit for review

## Questions
The Windows side (where the project and Android build live) can regenerate
assets, screenshots, or clarify any step. Ping back with the exact Xcode error
text if anything fails.
