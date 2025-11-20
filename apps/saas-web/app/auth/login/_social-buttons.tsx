"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import authClient from "../../../lib/auth/client";
import { FaGoogle } from "react-icons/fa"
import { FaGithub } from "react-icons/fa"
import Button from "@/modules/ui/button";

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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={handleGitHub}
        >
          <FaGithub className="h-3.5 w-3.5" />
          <span>Continue with GitHub</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={handleGoogle}
        >
          <FaGoogle className="h-3.5 w-3.5" />
          <span>Continue with Google</span>
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
