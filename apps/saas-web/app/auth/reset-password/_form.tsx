"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import type { ResetPasswordState } from "../../../actions/reset-password";
import { resetPasswordAction } from "../../../actions/reset-password";
import Button from "@/modules/ui/button";
import Input from "@/modules/ui/input";
import Label from "@/modules/ui/label";

export interface ResetPasswordFormProps {
  readonly token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps): ReactElement {
  const [state, formAction] = useActionState<ResetPasswordState, FormData>(resetPasswordAction, null);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="newPassword">
          New password
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
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
        Reset password
      </Button>
    </form>
  );
}
