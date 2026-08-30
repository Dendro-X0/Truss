"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/modules/ui/button";

const STORAGE_KEY = "truss-dev-mode-banner-dismissed";

export default function DevModeBanner(): ReactElement | null {
  const [mounted, setMounted] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect((): void => {
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    setMounted(true);
  }, []);

  function dismiss(): void {
    setDismissed(true);
    window.localStorage.setItem(STORAGE_KEY, "1");
  }

  if (!mounted || dismissed) {
    return null;
  }

  return (
    <div
      className="mb-6 flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground"
      role="status"
    >
      <p className="min-w-0 flex-1 leading-relaxed">
        <span className="font-medium text-foreground">Dev mode</span> — synthetic dashboard data while{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[10px]">DISABLE_AUTH_GUARD=1</code> is set. Sign in to use
        live API data.
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Dismiss dev mode notice"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
