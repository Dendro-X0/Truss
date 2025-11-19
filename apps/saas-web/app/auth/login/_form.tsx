"use client";

import type { ReactElement, FormEvent } from "react";
import { useActionState, useMemo, useState } from "react";
import type { LoginFormState } from "../../../actions/login";
import { loginAction } from "../../../actions/login";
import authClient from "../../../lib/auth/client";

export default function LoginForm(): ReactElement {
  const [state, formAction] = useActionState<LoginFormState, FormData>(loginAction, null);
  const [identifier, setIdentifier] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string>("");

  const isEmail: boolean = useMemo(() => /.+@.+\..+/.test(identifier), [identifier]);

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    // Allow the server action to handle submission.
    void event;
  }

  async function resendVerification(): Promise<void> {
    if (!isEmail) {
      return;
    }
    try {
      setSending(true);
      setResendMessage("");
      await authClient.sendVerificationEmail({
        email: identifier,
        callbackURL: "/auth/login",
      });
      setResendMessage("If the email exists, a verification link has been sent.");
    } catch (cause: unknown) {
      const message: string = cause instanceof Error ? cause.message : "Failed to send verification email";
      setResendMessage(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email or username</label>
        <input
          id="email"
          name="email"
          type="text"
          autoComplete="username"
          required
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      {state?.error?.message && (
        <p className="text-sm text-destructive">{state.error.message}</p>
      )}
      {state?.success && state.message && (
        <p className="text-sm text-emerald-600">{state.message}</p>
      )}
      {state?.error?.fields && isEmail && (
        <p className="text-xs text-muted-foreground">If your email is not verified, please check your inbox.</p>
      )}
      {isEmail && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              void resendVerification();
            }}
            disabled={sending}
            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-xs font-medium shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            Resend verification email
          </button>
          {resendMessage && (
            <p className="text-xs text-muted-foreground">{resendMessage}</p>
          )}
        </div>
      )}
      <button
        type="submit"
        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Sign in
      </button>
    </form>
  );
}
