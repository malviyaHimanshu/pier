"use client";

import { useEffect, type ReactNode } from "react";
import posthog from "posthog-js";

const posthogApiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogApiHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const allowedHostsValue = process.env.NEXT_PUBLIC_POSTHOG_ALLOWED_HOSTS ?? "";
const allowedHosts = new Set(
  allowedHostsValue
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)
);

let hasInitializedPostHog = false;

function canEnablePostHog(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  if (!posthogApiKey || allowedHosts.size === 0) {
    return false;
  }

  return allowedHosts.has(window.location.hostname.toLowerCase());
}

export function ensurePostHogInitialized(): boolean {
  if (!canEnablePostHog()) {
    return false;
  }

  if (hasInitializedPostHog) {
    return true;
  }

  posthog.init(posthogApiKey as string, {
    api_host: posthogApiHost,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    person_profiles: "never",
  });

  hasInitializedPostHog = true;
  return true;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    ensurePostHogInitialized();
  }, []);

  return <>{children}</>;
}
