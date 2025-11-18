"use client";

import type { ReactElement, FormEvent } from "react";
import { useState } from "react";
import authClient from "../../../lib/auth/client";

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
          <input
            id="magic-link-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="flex h-9 w-full rounded-md border px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="name@example.com"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-9 items-center justify-center rounded-md bg-muted px-3 text-xs font-medium text-foreground shadow-sm hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Send link
          </button>
        </div>
      </div>
      {message && <p className="text-[11px] text-muted-foreground">{message}</p>}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </form>
  );
}
