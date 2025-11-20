"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import Button from "@/modules/ui/button";

const DEMO_BANNER_STORAGE_KEY: string = "truss-demo-banner-dismissed";

export default function DemoBanner(): ReactElement | null {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);
  useEffect(() => {
    let stored: string | null = null;
    try {
      if (typeof window !== "undefined") {
        stored = window.localStorage.getItem(DEMO_BANNER_STORAGE_KEY);
      }
    } catch {
      stored = null;
    }
    if (stored === "1") {
      setDismissed(true);
    }
    setHydrated(true);
  }, []);
  function handleClose(): void {
    setDismissed(true);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(DEMO_BANNER_STORAGE_KEY, "1");
      }
    } catch {
      void 0;
    }
  }
  if (!hydrated || dismissed) {
    return null;
  }
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-2 text-xs text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/80 dark:text-amber-50">
      <div className="flex items-start justify-between gap-3">
        <p className="text-left">
          This deployment runs Truss in demo mode. The UI is live, but auth, database, and subscriptions are disabled.
        </p>
        <div className="flex items-start gap-2">
          <span className="hidden whitespace-nowrap text-[0.7rem] font-medium sm:inline">
            Clone the repo and configure environment variables to enable the full stack.
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            aria-label="Dismiss demo banner"
            className="h-6 px-2 text-[11px]"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
