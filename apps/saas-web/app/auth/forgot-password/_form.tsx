"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import type { RequestResetState } from "../../../actions/request-password-reset";
import { requestPasswordResetAction } from "../../../actions/request-password-reset";

export default function ForgotPasswordForm(): ReactElement {
  const [state, formAction] = useActionState<RequestResetState, FormData>(requestPasswordResetAction, null);
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
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
        Send reset link
      </button>
    </form>
  );
}
