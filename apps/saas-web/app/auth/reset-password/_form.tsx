"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import type { ResetPasswordState } from "../../../actions/reset-password";
import { resetPasswordAction } from "../../../actions/reset-password";

export interface ResetPasswordFormProps {
  readonly token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps): ReactElement {
  const [state, formAction] = useActionState<ResetPasswordState, FormData>(resetPasswordAction, null);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium">New password</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
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
      <button
        type="submit"
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Reset password
      </button>
    </form>
  );
}
