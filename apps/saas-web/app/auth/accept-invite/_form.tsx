"use client";

import type { ReactElement } from "react";
import { useActionState } from "react";
import type { AcceptInviteState } from "../../../actions/accept-invite";
import { acceptInviteAction } from "../../../actions/accept-invite";

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
      <button
        type="submit"
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Accept invitation
      </button>
    </form>
  );
}
