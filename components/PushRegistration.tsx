"use client";

import { useEffect } from "react";

// Registers the device for push notifications — but ONLY when running inside
// the native Capacitor app. In a normal browser this is a complete no-op:
// every Capacitor module is dynamically imported behind an isNativePlatform()
// guard, so web visitors never download or run any of it.
//
// Flow: ask permission (after a short delay so content shows first) -> register
// with FCM/APNs -> POST the device token to /api/push/register. Tapping a
// notification with a `url` in its data payload deep-links into that page.
export default function PushRegistration() {
  useEffect(() => {
    let cancelled = false;
    let removeListeners: (() => void) | null = null;

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { PushNotifications } = await import(
          "@capacitor/push-notifications"
        );
        const platform = Capacitor.getPlatform(); // "android" | "ios"

        // Token arrives here once registration succeeds.
        const regHandle = await PushNotifications.addListener(
          "registration",
          (tok: { value: string }) => {
            void fetch("/api/push/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: tok.value, platform }),
              keepalive: true,
            }).catch(() => {});
          },
        );

        const errHandle = await PushNotifications.addListener(
          "registrationError",
          () => {},
        );

        // Deep-link when the user taps a notification carrying a url payload.
        const tapHandle = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action: { notification: { data?: Record<string, string> } }) => {
            const url = action?.notification?.data?.url;
            if (url && typeof url === "string") {
              window.location.href = url;
            }
          },
        );

        removeListeners = () => {
          regHandle.remove();
          errHandle.remove();
          tapHandle.remove();
        };

        // Let the app paint before the OS permission prompt appears.
        await new Promise((r) => setTimeout(r, 2500));
        if (cancelled) return;

        const perm = await PushNotifications.checkPermissions();
        let receive = perm.receive;
        if (receive === "prompt" || receive === "prompt-with-rationale") {
          receive = (await PushNotifications.requestPermissions()).receive;
        }
        if (receive === "granted") {
          await PushNotifications.register();
        }
      } catch {
        // Never let push setup break the app shell.
      }
    })();

    return () => {
      cancelled = true;
      if (removeListeners) removeListeners();
    };
  }, []);

  return null;
}
