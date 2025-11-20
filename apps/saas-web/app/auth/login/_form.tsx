"use client";

import type { ReactElement, FormEvent } from "react";
import { useActionState, useMemo, useState } from "react";
import type { LoginFormState } from "../../../actions/login";
import { loginAction } from "../../../actions/login";
import authClient from "../../../lib/auth/client";
import Button from "@/modules/ui/button";
import Input from "@/modules/ui/input";
import Label from "@/modules/ui/label";

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
        <Label htmlFor="email">
          Email or username
        </Label>
        <Input
          id="email"
          name="email"
          type="text"
          autoComplete="username"
          required
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          size="lg"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          size="lg"
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={sending}
            className="w-full text-xs md:w-auto"
            onClick={() => {
              void resendVerification();
            }}
          >
            Resend verification email
          </Button>
          {resendMessage && (
            <p className="text-xs text-muted-foreground">{resendMessage}</p>
          )}
        </div>
      )}
      <Button type="submit" size="lg" className="w-full">
        Sign in
      </Button>
    </form>
  );
}
