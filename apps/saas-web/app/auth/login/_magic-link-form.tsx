"use client";

import type { ReactElement, FormEvent } from "react";
import { useState } from "react";
import authClient from "../../../lib/auth/client";
import Button from "@/modules/ui/button";
import Input from "@/modules/ui/input";

export default function MagicLinkForm(): ReactElement | null {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!authClient.signIn?.magicLink) {
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setSubmitting(true);
    try {
      const trimmedEmail: string = email.trim();
      const result = await authClient.signIn.magicLink({
        email: trimmedEmail,
        callbackURL: "/user",
      });
      if (result.error) {
        setError(result.error.message ?? "Magic link sign-in failed");
      } else {
        setMessage("Magic link sent. Check the server console for the URL in this starter.");
      }
    } catch (cause) {
      const messageText: string = cause instanceof Error ? cause.message : "Magic link sign-in failed";
      setError(messageText);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="space-y-1">
        <label htmlFor="magic-link-email" className="text-xs font-medium text-muted-foreground">Or use a magic link</label>
        <div className="flex gap-2">
          <Input
            id="magic-link-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            size="sm"
            className="text-xs"
            placeholder="name@example.com"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={submitting}
            className="bg-muted text-xs text-foreground hover:bg-muted/80"
          >
            Send link
          </Button>
        </div>
      </div>
      {message && <p className="text-[11px] text-muted-foreground">{message}</p>}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </form>
  );
}
