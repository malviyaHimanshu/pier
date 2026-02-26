"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { ensurePostHogInitialized } from "@/lib/posthog-client";

export function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPathRef = useRef<string | null>(null);
  const search = searchParams.toString();

  useEffect(() => {
    if (!pathname || !ensurePostHogInitialized()) {
      return;
    }

    const pageKey = search ? `${pathname}?${search}` : pathname;
    if (lastTrackedPathRef.current === pageKey) {
      return;
    }

    lastTrackedPathRef.current = pageKey;
    const searchWithPrefix = search ? `?${search}` : "";

    posthog.capture("$pageview", {
      path: pathname,
      search: searchWithPrefix,
      url: `${window.location.origin}${pathname}${searchWithPrefix}`
    });
  }, [pathname, search]);

  return null;
}
