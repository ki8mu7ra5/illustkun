"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { getGaMeasurementId } from "@/app/lib/analytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function sendPageView(gaId: string, pathname: string, search: string) {
  const pagePath = search ? `${pathname}?${search}` : pathname;
  window.gtag?.("config", gaId, {
    page_path: pagePath,
  });
}

function GtagRouteChangeInner({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    sendPageView(gaId, pathname, searchParams.toString());
  }, [gaId, pathname, searchParams]);

  return null;
}

/** Sends page_view on client-side route changes (App Router). Initial view is handled by gtag config in layout. */
export function GtagRouteChange({ gaId }: { gaId: string }) {
  return (
    <Suspense fallback={null}>
      <GtagRouteChangeInner gaId={gaId} />
    </Suspense>
  );
}

/** Logs a warning in development when GA4 is not configured. */
export function GaConfigWarning() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!getGaMeasurementId()) {
      console.warn(
        "[GA4] NEXT_PUBLIC_GA_ID is not set or invalid. Analytics will not load.",
      );
    }
  }, []);

  return null;
}
