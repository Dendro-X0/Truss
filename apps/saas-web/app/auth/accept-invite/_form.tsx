"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import type { AcceptInviteState } from "../../../actions/accept-invite";
import { acceptInviteAction } from "../../../actions/accept-invite";
import Button from "@/modules/ui/button";

export interface AcceptInviteFormProps {
  readonly token: string;
}

export default function AcceptInviteForm({ token }: AcceptInviteFormProps): ReactElement {
  const [state, formAction] = useActionState<AcceptInviteState | null, FormData>(acceptInviteAction, null);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <p className="text-xs text-muted-foreground">
        Click confirm to accept this invitation. You must be signed in for it to be associated with your account.
      </p>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && state.message && (
        <p className="text-sm text-emerald-600">{state.message}</p>
      )}
      <Button type="submit" size="md" className="w-full">
        Accept invitation
      </Button>
    </form>
  );
}
