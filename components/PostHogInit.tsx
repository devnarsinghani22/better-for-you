"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

const POSTHOG_KEY = "phc_xCjjiySRu5GYHhakVTqyJU9r5rRtLjoAdpD3ABfLLEYY";
const POSTHOG_HOST = "https://us.i.posthog.com";

export default function PostHogInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as unknown as { __ph_inited?: boolean }).__ph_inited) return;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: "history_change",
      capture_pageleave: true,
      person_profiles: "identified_only",
      autocapture: true,
    });
    (window as unknown as { __ph_inited?: boolean }).__ph_inited = true;
  }, []);
  return null;
}
