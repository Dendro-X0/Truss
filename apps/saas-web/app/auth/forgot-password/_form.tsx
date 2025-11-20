"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import type { RequestResetState } from "../../../actions/request-password-reset";
import { requestPasswordResetAction } from "../../../actions/request-password-reset";
import Button from "@/modules/ui/button";
import Input from "@/modules/ui/input";
import Label from "@/modules/ui/label";

export default function ForgotPasswordForm(): ReactElement {
  const [state, formAction] = useActionState<RequestResetState, FormData>(requestPasswordResetAction, null);
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
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
      <Button type="submit" size="lg" className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
