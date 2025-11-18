"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import authClient from "../../../lib/auth/client";
import { Github } from "lucide-react";

export default function SocialButtons(): ReactElement {
  const [error, setError] = useState<string | null>(null);

  async function handleGitHub(): Promise<void> {
    setError(null);
    try {
      await authClient.signIn.social({ provider: "github" });
    } catch (cause) {
      const message: string = cause instanceof Error ? cause.message : "GitHub sign-in failed";
      setError(message);
    }
  }

  async function handleGoogle(): Promise<void> {
    setError(null);
    try {
      await authClient.signIn.social({ provider: "google" });
    } catch (cause) {
      const message: string = cause instanceof Error ? cause.message : "Google sign-in failed";
      setError(message);
    }
  }

  if (!authClient.signIn?.social) {
    return <></>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={handleGitHub}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Github className="h-3.5 w-3.5" />
          <span>Continue with GitHub</span>
        </button>
        <button
          type="button"
          onClick={handleGoogle}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px] bg-white text-[10px] font-bold text-[#4285F4] shadow-sm">
            G
          </span>
          <span>Continue with Google</span>
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
