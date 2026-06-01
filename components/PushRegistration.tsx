"use client";

import { useEffect } from "react";

// Registers the device for push notifications — native Capacitor app only. In a
// browser every Capacitor module is dynamically imported behind an
// isNativePlatform() guard, so web visitors never run any of it.
//
// Android uses @capacitor/push-notifications (its "registration" event returns
// the FCM token natively). iOS uses Firebase Messaging instead: on iOS the
// @capacitor/push-notifications "registration" event never fires because
// Firebase's method swizzling intercepts the APNs callback, so the FCM token has
// to be pulled from Firebase Messaging directly. The plugin is accessed by name
// via registerPlugin so its web implementation (and the firebase JS SDK peer
// dep) never enters the website bundle. Tapping a notification carrying a `url`
// in its data payload deep-links into that page.
export default function PushRegistration() {
  useEffect(() => {
    let cancelled = false;
    let removeListeners: (() => void) | null = null;

    // TEMP DEBUG (iOS push): every call posts here; the endpoint records it in
    // push_debug so we can confirm the FCM token now arrives. Remove once
    // iOS push is verified working.
    const post = (payload: Record<string, unknown>) =>
      void fetch("/api/push/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});

    (async () => {
      try {
        const { Capacitor, registerPlugin } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const platform = Capacitor.getPlatform(); // "android" | "ios"
        post({ stage: "mount", platform });

        const deepLink = (data?: Record<string, unknown>) => {
          const url = data?.url;
          if (typeof url === "string" && url) window.location.href = url;
        };

        if (platform === "ios") {
          const FirebaseMessaging =
            registerPlugin<FirebaseMessagingPlugin>("FirebaseMessaging");

          // FCM token on (re)issue.
          const tokHandle = await FirebaseMessaging.addListener(
            "tokenReceived",
            (e) => {
              if (e?.token) post({ token: e.token, platform });
            },
          );
          // Deep-link on notification tap.
          const tapHandle = await FirebaseMessaging.addListener(
            "notificationActionPerformed",
            (e) => deepLink(e?.notification?.data),
          );
          removeListeners = () => {
            tokHandle.remove();
            tapHandle.remove();
          };

          // Let the app paint before the OS permission prompt appears.
          await new Promise((r) => setTimeout(r, 2500));
          if (cancelled) return;

          let receive = (await FirebaseMessaging.checkPermissions()).receive;
          if (receive === "prompt" || receive === "prompt-with-rationale") {
            receive = (await FirebaseMessaging.requestPermissions()).receive;
          }
          post({ stage: "perm", platform, receive });
          if (receive === "granted") {
            const { token } = await FirebaseMessaging.getToken();
            post({ stage: "got-token", platform, len: token?.length ?? 0 });
            if (token) post({ token, platform });
          }
          return;
        }

        // Android: @capacitor/push-notifications returns the FCM token directly.
        const { PushNotifications } = await import(
          "@capacitor/push-notifications"
        );
        const regHandle = await PushNotifications.addListener(
          "registration",
          (tok: { value: string }) => post({ token: tok.value, platform }),
        );
        const tapHandle = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action: { notification: { data?: Record<string, string> } }) =>
            deepLink(action?.notification?.data),
        );
        removeListeners = () => {
          regHandle.remove();
          tapHandle.remove();
        };

        await new Promise((r) => setTimeout(r, 2500));
        if (cancelled) return;
        let receive = (await PushNotifications.checkPermissions()).receive;
        if (receive === "prompt" || receive === "prompt-with-rationale") {
          receive = (await PushNotifications.requestPermissions()).receive;
        }
        if (receive === "granted") await PushNotifications.register();
      } catch (e) {
        // TEMP DEBUG (iOS push): surface any thrown error in the flow.
        post({ stage: "exception", error: String(e) });
      }
    })();

    return () => {
      cancelled = true;
      if (removeListeners) removeListeners();
    };
  }, []);

  return null;
}

// Minimal typing for the native @capacitor-firebase/messaging plugin, accessed
// by name so its web implementation (and the firebase JS SDK peer dependency) is
// never pulled into the website bundle.
interface FirebaseMessagingPlugin {
  checkPermissions(): Promise<{ receive: string }>;
  requestPermissions(): Promise<{ receive: string }>;
  getToken(): Promise<{ token: string }>;
  addListener(
    eventName: "tokenReceived" | "notificationActionPerformed",
    listenerFunc: (event: {
      token?: string;
      notification?: { data?: Record<string, unknown> };
    }) => void,
  ): Promise<{ remove: () => void }>;
}
